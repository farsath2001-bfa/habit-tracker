const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const { normalizeDate } = require('../utils/analyticsUtils');

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
};

// @desc    Create or update (upsert) a completion record for a habit+date
// @route   POST /api/completions
// @access  Private
const upsertCompletion = asyncHandler(async (req, res) => {
  handleValidation(req, res);

  const { habitId, date, completed, note } = req.body;

  const habit = await Habit.findOne({ _id: habitId, user: req.userId });
  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  const normalizedDate = normalizeDate(date || new Date());

  // Only touch `note` when the caller actually sent one - a plain
  // completion toggle (no note field in the request) must never wipe out
  // a note that was saved earlier for this day.
  const update = {
    user: req.userId,
    habit: habitId,
    date: normalizedDate,
    completed: completed !== undefined ? completed : true,
  };
  if (note !== undefined) {
    update.note = note;
  }

  const completion = await HabitCompletion.findOneAndUpdate(
    { habit: habitId, date: normalizedDate },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(completion);
});

// @desc    Get completions for the current user within a date range and/or habit
// @route   GET /api/completions?from=&to=&habitId=
// @access  Private
const getCompletions = asyncHandler(async (req, res) => {
  const { from, to, habitId } = req.query;

  const query = { user: req.userId };

  if (habitId) {
    query.habit = habitId;
  }

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = normalizeDate(from);
    if (to) query.date.$lte = normalizeDate(to);
  } else {
    // Default: last 120 days
    const to120 = normalizeDate(new Date());
    const from120 = new Date(to120.getTime() - 119 * 24 * 60 * 60 * 1000);
    query.date = { $gte: from120, $lte: to120 };
  }

  const completions = await HabitCompletion.find(query).sort({ date: 1 });
  res.json(completions);
});

module.exports = { upsertCompletion, getCompletions };