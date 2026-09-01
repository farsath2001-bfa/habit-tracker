const asyncHandler = require('express-async-handler');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const {
  normalizeDate,
  dateKey,
  dateRange,
  computeDailyPercents,
  computeOverallStreaks,
  computeHabitStreaks,
} = require('../utils/analyticsUtils');

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fetches this user's habits + a window of completions in one shot.
 * Archived (paused) habits are excluded here so a habit the user stopped
 * tracking doesn't keep dragging down streaks/percentages after it's paused.
 */
const fetchUserData = async (userId, windowDays = 365) => {
  const habits = await Habit.find({ user: userId, archived: { $ne: true } });
  const to = normalizeDate(new Date());
  const from = new Date(to.getTime() - (windowDays - 1) * DAY_MS);
  const completions = await HabitCompletion.find({
    user: userId,
    date: { $gte: from, $lte: to },
  });
  return { habits, completions };
};

// @desc    Dashboard summary analytics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const { habits, completions } = await fetchUserData(req.userId, 365);

  const today = normalizeDate(new Date());
  const todayKey = dateKey(today);

  const todayDaily = computeDailyPercents(habits, completions, today, today)[0];
  const todayCompletionPercent = todayDaily ? todayDaily.percent : 100;

  const { currentStreak, bestStreak } = computeOverallStreaks(habits, completions, 365);

  const totalHabits = habits.length;

  // Recent trend: last 14 days
  const trendFrom = new Date(today.getTime() - 13 * DAY_MS);
  const recentTrend = computeDailyPercents(habits, completions, trendFrom, today).map((d) => ({
    date: d.date,
    percent: d.percent,
  }));

  res.json({
    todayCompletionPercent,
    currentStreak,
    bestStreak,
    totalHabits,
    recentTrend,
    today: todayKey,
  });
});

// @desc    Weekly completion % per day (current week, Sun-Sat)
// @route   GET /api/analytics/weekly
// @access  Private
const getWeeklyAnalytics = asyncHandler(async (req, res) => {
  const { habits, completions } = await fetchUserData(req.userId, 60);

  const today = normalizeDate(new Date());
  const dow = today.getUTCDay();
  const weekStart = new Date(today.getTime() - dow * DAY_MS);
  const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);

  const daily = computeDailyPercents(habits, completions, weekStart, weekEnd);
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const result = daily.map((d, i) => ({
    date: d.date,
    day: labels[i],
    percent: d.percent,
    completed: d.completed,
    scheduled: d.scheduled,
  }));

  res.json(result);
});

// @desc    Monthly completion % per day (current calendar month)
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyAnalytics = asyncHandler(async (req, res) => {
  const { habits, completions } = await fetchUserData(req.userId, 400);

  const now = new Date();
  const year = req.query.year ? parseInt(req.query.year, 10) : now.getUTCFullYear();
  const month = req.query.month ? parseInt(req.query.month, 10) : now.getUTCMonth(); // 0-indexed

  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0));

  const daily = computeDailyPercents(habits, completions, monthStart, monthEnd);

  res.json({
    year,
    month,
    days: daily,
  });
});

// @desc    Per-habit streak breakdown + overall totals
// @route   GET /api/analytics/streaks
// @access  Private
const getStreakAnalytics = asyncHandler(async (req, res) => {
  const { habits, completions } = await fetchUserData(req.userId, 365);

  const perHabit = habits.map((habit) => {
    const habitCompletions = completions.filter(
      (c) => c.habit.toString() === habit._id.toString()
    );
    const stats = computeHabitStreaks(habit, habitCompletions, 365);
    return {
      habitId: habit._id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      ...stats,
    };
  });

  const overall = computeOverallStreaks(habits, completions, 365);

  const totals = perHabit.reduce(
    (acc, h) => {
      acc.totalCompleted += h.totalCompleted;
      acc.totalMissed += h.totalMissed;
      return acc;
    },
    { totalCompleted: 0, totalMissed: 0 }
  );

  res.json({
    habits: perHabit,
    overall: {
      currentStreak: overall.currentStreak,
      bestStreak: overall.bestStreak,
      totalCompleted: totals.totalCompleted,
      totalMissed: totals.totalMissed,
    },
  });
});

module.exports = {
  getDashboardAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getStreakAnalytics,
};