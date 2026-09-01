/** Normalizes a Date/string to a 'YYYY-MM-DD' key in UTC. */
export const toDateKey = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);
};

/** Formats a date key or Date as a friendly label, e.g. "Aug 30, 2026". */
export const formatFriendlyDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Formats a date as a short label, e.g. "Aug 30". */
export const formatShortDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/** Returns "Good morning" / "Good afternoon" / "Good evening" based on local hour. */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_LABELS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Returns an array of the last N date keys (including today), oldest first. */
export const lastNDateKeys = (n) => {
  const keys = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    keys.push(toDateKey(d));
  }
  return keys;
};

/**
 * Determines whether a habit is scheduled on a given date, mirroring the
 * backend's server/utils/analyticsUtils.js logic so the UI can compute
 * per-day habit status without an extra round trip.
 */
export const isHabitScheduledOnDate = (habit, dateKeyOrDate) => {
  const day = new Date(toDateKey(dateKeyOrDate));
  const start = new Date(toDateKey(habit.startDate || habit.createdAt || day));
  if (day < start) return false;

  const dow = day.getUTCDay();
  switch (habit.frequency) {
    case 'Daily':
      return true;
    case 'Weekdays':
      return dow >= 1 && dow <= 5;
    case 'Weekends':
      return dow === 0 || dow === 6;
    case 'Custom':
      return Array.isArray(habit.customDays) && habit.customDays.includes(dow);
    default:
      return true;
  }
};

export const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Number of days in a given month (month is 0-indexed, like Date). */

export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export const monthRangeKeys = (year, month) => {
  const from = toDateKey(new Date(year, month, 1));
  const to = toDateKey(new Date(year, month, daysInMonth(year, month)));
  return { from, to };
};

export const buildMonthGrid = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const totalDays = daysInMonth(year, month);
  const startPad = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) {
    const d = new Date(year, month, day);
    cells.push({ day, dateKey: toDateKey(d) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};
/** Weekday header labels rotated to start on the given day (0=Sunday, 1=Monday). */
export const getWeekdayLabels = (startDay = 0) => {
  const rotated = [...WEEKDAY_LABELS.slice(startDay), ...WEEKDAY_LABELS.slice(0, startDay)];
  return rotated;
};