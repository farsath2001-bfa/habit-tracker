import { toDateKey } from './dateUtils';

/** Escapes a value for a CSV cell (quotes it if it contains a comma, quote, or newline). */
const csvCell = (value) => {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Builds a CSV string, one row per completion record (both completed and
 * not-completed entries), each joined with that entry's habit details.
 * Long/tidy format so it opens cleanly in Excel/Sheets and is easy to pivot.
 */
export const buildHabitsCsv = (habits, completions) => {
  const habitsById = new Map(habits.map((h) => [String(h._id), h]));
  const header = ['Date', 'Habit', 'Category', 'Frequency', 'Goal', 'Completed'];

  const rows = completions
    .slice()
    .sort((a, b) => {
      const ak = toDateKey(a.date);
      const bk = toDateKey(b.date);
      return ak < bk ? -1 : ak > bk ? 1 : 0;
    })
    .map((c) => {
      const habit = habitsById.get(String(c.habit));
      return [
        toDateKey(c.date),
        habit?.name ?? '(deleted habit)',
        habit?.category ?? '',
        habit?.frequency ?? '',
        habit?.goal ?? '',
        c.completed ? 'Yes' : 'No',
      ];
    });

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
};

/** Triggers a browser download of `content` as a file named `filename`. */
export const downloadCsv = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};