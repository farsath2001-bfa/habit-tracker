/** Triggers a browser download of a Blob with the given filename. */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Builds a flat report row set: one row per (habit, date) completion record,
 * enriched with the habit's name, current streak and overall completion %.
 */
export const buildReportRows = (habits, completions, streakData) => {
  const streaksByHabit = new Map((streakData?.habits || []).map((h) => [String(h.habitId), h]));
  const habitsById = new Map(habits.map((h) => [String(h._id), h]));

  return completions
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((c) => {
      const habit = habitsById.get(String(c.habit));
      const streak = streaksByHabit.get(String(c.habit));
      return {
        habit: habit ? habit.name : 'Unknown habit',
        date: new Date(c.date).toISOString().slice(0, 10),
        completed: c.completed ? 'Yes' : 'No',
        currentStreak: streak ? streak.currentStreak : '',
        bestStreak: streak ? streak.bestStreak : '',
        completionPercent: streak ? `${streak.completionPercent}%` : '',
      };
    });
};

export const exportToCSV = (rows, filename = 'habit-report.csv') => {
  if (!rows.length) {
    const blob = new Blob(['habit,date,completed,currentStreak,bestStreak,completionPercent\n'], {
      type: 'text/csv',
    });
    downloadBlob(blob, filename);
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? '');
          return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(',')
    ),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

export const exportToJSON = (rows, filename = 'habit-report.json') => {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
};

/** Generates a simple PDF report client-side using jsPDF. Nice-to-have export format. */
export const exportToPDF = async (rows, title = 'Habit Tracker Report') => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const marginX = 14;
  let y = 18;

  doc.setFontSize(16);
  doc.text(title, marginX, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y);
  y += 10;

  doc.setTextColor(20);
  doc.setFontSize(9);
  const headers = ['Habit', 'Date', 'Completed', 'Current Streak', 'Best Streak', 'Completion %'];
  const colWidths = [40, 28, 24, 28, 24, 28];

  const drawRow = (cells, isHeader = false) => {
    let x = marginX;
    doc.setFont(undefined, isHeader ? 'bold' : 'normal');
    cells.forEach((cell, i) => {
      doc.text(String(cell), x, y);
      x += colWidths[i];
    });
    y += 6;
  };

  drawRow(headers, true);
  doc.setDrawColor(200);
  doc.line(marginX, y - 4, marginX + colWidths.reduce((a, b) => a + b, 0), y - 4);

  rows.forEach((row) => {
    if (y > 280) {
      doc.addPage();
      y = 18;
      drawRow(headers, true);
    }
    drawRow([row.habit, row.date, row.completed, row.currentStreak, row.bestStreak, row.completionPercent]);
  });

  doc.save('habit-report.pdf');
};
