/**
 * Shared analytics helpers for computing which days a habit is "scheduled",
 * completion percentages, and streaks. Kept here so the logic is defined
 * once and reused consistently across every analytics endpoint.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Normalize any Date/string to midnight UTC of that calendar day. */
const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/** Returns a 'YYYY-MM-DD' key for a date, used for map lookups. */
const dateKey = (date) => normalizeDate(date).toISOString().slice(0, 10);

/**
 * Determines whether a given habit is scheduled to occur on a given date,
 * based on its frequency/customDays and startDate.
 */
const isHabitScheduledOnDate = (habit, date) => {
  const day = normalizeDate(date);
  const start = normalizeDate(habit.startDate || habit.createdAt || day);

  if (day < start) return false;

  const dow = day.getUTCDay(); // 0 = Sunday ... 6 = Saturday

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

/** Builds an inclusive array of normalized dates from `from` to `to`. */
const dateRange = (from, to) => {
  const dates = [];
  let cur = normalizeDate(from);
  const end = normalizeDate(to);
  while (cur <= end) {
    dates.push(cur);
    cur = new Date(cur.getTime() + DAY_MS);
  }
  return dates;
};

/**
 * Given all of a user's habits and all their completions in a window,
 * computes the completion percentage for each day in the range.
 * A day with zero scheduled habits is treated as 100% (nothing missed).
 * Returns an array of { date: 'YYYY-MM-DD', percent, scheduled, completed }
 */
const computeDailyPercents = (habits, completions, from, to) => {
  const completedSet = new Set(
    completions.filter((c) => c.completed).map((c) => `${c.habit.toString()}_${dateKey(c.date)}`)
  );

  return dateRange(from, to).map((date) => {
    const key = dateKey(date);
    const scheduledHabits = habits.filter(
      (h) => normalizeDate(h.startDate || h.createdAt) <= date && isHabitScheduledOnDate(h, date)
    );
    const scheduled = scheduledHabits.length;
    const completed = scheduledHabits.filter((h) =>
      completedSet.has(`${h._id.toString()}_${key}`)
    ).length;
    const percent = scheduled === 0 ? 100 : Math.round((completed / scheduled) * 100);
    return { date: key, percent, scheduled, completed };
  });
};

/**
 * Computes the overall "current streak" and "best streak" across ALL of a
 * user's habits combined. Definition used consistently app-wide:
 * A day "counts" toward the streak if every habit scheduled that day was
 * completed (a day with zero scheduled habits does NOT break or extend
 * the streak - it's simply skipped). The current streak counts backward
 * from today (or yesterday, if today isn't finished yet and has 0% so far
 * with scheduled habits pending) until a fully-missed scheduled day is hit.
 */
const computeOverallStreaks = (habits, completions, windowDays = 365) => {
  const today = normalizeDate(new Date());
  const from = new Date(today.getTime() - (windowDays - 1) * DAY_MS);
  const daily = computeDailyPercents(habits, completions, from, today);

  // A day "counts" (is a streak day) if it had >=1 scheduled habit and all were completed.
  // Days with 0 scheduled habits are neutral - they don't break a streak, just skipped.
  const countsArr = daily.map((d) => ({
    ...d,
    isStreakDay: d.scheduled > 0 && d.completed === d.scheduled,
    isMissDay: d.scheduled > 0 && d.completed < d.scheduled,
  }));

  // Current streak: walk backward from the most recent day.
  let currentStreak = 0;
  for (let i = countsArr.length - 1; i >= 0; i -= 1) {
    const day = countsArr[i];
    if (day.isMissDay) break;
    if (day.isStreakDay) currentStreak += 1;
    // neutral (0 scheduled) days are skipped without breaking or counting
  }

  // Best streak: longest consecutive run of streak days across the window (neutral days don't break it)
  let bestStreak = 0;
  let running = 0;
  countsArr.forEach((day) => {
    if (day.isMissDay) {
      running = 0;
    } else if (day.isStreakDay) {
      running += 1;
      bestStreak = Math.max(bestStreak, running);
    }
    // neutral days: running carries over unchanged
  });
  bestStreak = Math.max(bestStreak, currentStreak);

  return { currentStreak, bestStreak, daily: countsArr };
};

/**
 * Computes per-habit streak stats: currentStreak, bestStreak, totalCompleted,
 * totalMissed, for a single habit given its completions.
 */
const computeHabitStreaks = (habit, completions, windowDays = 365) => {
  const today = normalizeDate(new Date());
  const from = new Date(today.getTime() - (windowDays - 1) * DAY_MS);
  const start = normalizeDate(habit.startDate || habit.createdAt || from);
  const effectiveFrom = start > from ? start : from;

  const completedSet = new Set(
    completions.filter((c) => c.completed).map((c) => dateKey(c.date))
  );

  const days = dateRange(effectiveFrom, today).filter((d) => isHabitScheduledOnDate(habit, d));

  let totalCompleted = 0;
  let totalMissed = 0;
  let bestStreak = 0;
  let running = 0;

  days.forEach((d) => {
    const key = dateKey(d);
    if (completedSet.has(key)) {
      totalCompleted += 1;
      running += 1;
      bestStreak = Math.max(bestStreak, running);
    } else {
      totalMissed += 1;
      running = 0;
    }
  });

  // Current streak: walk backward through scheduled days until a miss
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const key = dateKey(days[i]);
    if (completedSet.has(key)) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  const totalScheduled = days.length;
  const completionPercent =
    totalScheduled === 0 ? 0 : Math.round((totalCompleted / totalScheduled) * 100);

  return { currentStreak, bestStreak, totalCompleted, totalMissed, totalScheduled, completionPercent };
};

module.exports = {
  DAY_MS,
  normalizeDate,
  dateKey,
  isHabitScheduledOnDate,
  dateRange,
  computeDailyPercents,
  computeOverallStreaks,
  computeHabitStreaks,
};
