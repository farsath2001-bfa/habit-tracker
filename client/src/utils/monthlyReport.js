import { formatFriendlyDate } from './dateUtils';

const hexToRgb = (hex) => {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
};

/** Shortens a string with an ellipsis so it can't spill into the next PDF column. */
const truncate = (str, maxChars) => {
  const s = str || '';
  return s.length > maxChars ? `${s.slice(0, maxChars - 1)}…` : s;
};

/**
 * Generates a one-month PDF summary for the month currently shown on the
 * Habits page: overall completion, a "top habit", and a per-habit
 * breakdown table. Client-side only, via jsPDF - same approach as
 * utils/exportUtils.js's exportToPDF, just scoped to a single month instead
 * of the full completion history.
 */
export const generateMonthlyReportPdf = async ({
  monthLabel,
  year,
  monthStats, // { percent, completed, scheduled, topHabit, perHabit: [{ habit, scheduled, completed, percent }] }
  streaksByHabit, // Map<habitId, streak stats> - used for the "current streak" column
  archivedCount = 0,
}) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const marginX = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y;

  const [ar, ag, ab] = hexToRgb('#6366f1'); // ACCENT.light, so the report matches the app's brand color

  const drawHeaderBar = () => {
    doc.setFillColor(ar, ag, ab);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Habit Tracker — Monthly Report', marginX, 16);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`${monthLabel} ${year}`, marginX, 24);
  };

  drawHeaderBar();

  doc.setTextColor(120);
  doc.setFontSize(9);
  y = 38;
  doc.text(`Generated ${formatFriendlyDate(new Date())}`, marginX, y);
  y += 10;

  // Summary tiles
  const tiles = [
    { label: 'Overall Completion', value: `${monthStats.percent}%` },
    { label: 'Days Completed', value: `${monthStats.completed} / ${monthStats.scheduled}` },
    {
      label: 'Top Habit',
      value: monthStats.topHabit
        ? truncate(`${monthStats.topHabit.habit.name} (${monthStats.topHabit.percent}%)`, 24)
        : '—',
    },
    { label: 'Habits Tracked', value: `${monthStats.perHabit.length}` },
  ];
  const tileGap = 4;
  const tileWidth = (pageWidth - marginX * 2 - tileGap * (tiles.length - 1)) / tiles.length;
  tiles.forEach((tile, i) => {
    const x = marginX + i * (tileWidth + tileGap);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, tileWidth, 22, 2, 2, 'S');
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.text(tile.label, x + 4, y + 8);
    doc.setTextColor(30);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(String(tile.value), x + 4, y + 17);
    doc.setFont(undefined, 'normal');
  });
  y += 34;

  // Per-habit table, best completion % first
  const headers = ['Habit', 'Category', 'Frequency', 'Goal', 'Sched.', 'Done', 'Compl. %', 'Streak'];
  const colWidths = [40, 26, 24, 16, 18, 16, 20, 18];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  const drawTableHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y - 5, tableWidth, 7, 'F');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    let x = marginX;
    headers.forEach((h, i) => {
      doc.text(h, x + 2, y);
      x += colWidths[i];
    });
    doc.setFont(undefined, 'normal');
    y += 8;
  };

  drawTableHeader();

  const sortedHabits = [...monthStats.perHabit].sort((a, b) => b.percent - a.percent);

  if (sortedHabits.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('No active habits this month.', marginX, y);
    y += 8;
  }

  sortedHabits.forEach(({ habit, scheduled, completed, percent }) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
      drawTableHeader();
    }
    const streak = streaksByHabit.get(String(habit._id));
    const row = [
      truncate(habit.name, 20),
      truncate(habit.category && habit.category !== 'Other' ? habit.category : '—', 13),
      habit.frequency,
      String(habit.goal || 1),
      String(scheduled),
      String(completed),
      `${percent}%`,
      String(streak?.currentStreak ?? 0),
    ];
    doc.setFontSize(9);
    doc.setTextColor(30);
    let x = marginX;
    row.forEach((cell, i) => {
      doc.text(cell, x + 2, y);
      x += colWidths[i];
    });
    doc.setDrawColor(241, 245, 249);
    doc.line(marginX, y + 2, marginX + tableWidth, y + 2);
    y += 7;
  });

  if (archivedCount > 0) {
    y += 4;
    if (y > 285) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${archivedCount} paused habit${archivedCount === 1 ? '' : 's'} not included in this report.`,
      marginX,
      y
    );
  }

  doc.save(`habit-report-${monthLabel}-${year}.pdf`);
};