const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
};

// @desc    Get all habits for the current user
// @route   GET /api/habits
// @access  Private
const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(habits);
});

// @desc    Get a single habit (must belong to current user)
// @route   GET /api/habits/:id
// @access  Private
const getHabitById = asyncHandler(async (req, res) => {
  const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }
  res.json(habit);
});

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
const createHabit = asyncHandler(async (req, res) => {
  handleValidation(req, res);

  const {
    name,
    description,
    icon,
    color,
    frequency,
    customDays,
    startDate,
    goal,
    reminderTime,
    category,
  } = req.body;

  const habit = await Habit.create({
    user: req.userId,
    name,
    description,
    icon,
    color,
    frequency,
    customDays: frequency === 'Custom' ? customDays : [],
    startDate,
    goal,
    reminderTime,
    category,
  });

  res.status(201).json(habit);
});

// @desc    Update a habit (must belong to current user)
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = asyncHandler(async (req, res) => {
  handleValidation(req, res);

  const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  const fields = [
    'name',
    'description',
    'icon',
    'color',
    'frequency',
    'customDays',
    'startDate',
    'goal',
    'reminderTime',
    'archived',
    'category',
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      habit[field] = req.body[field];
    }
  });
  if (habit.frequency !== 'Custom') {
    habit.customDays = [];
  }

  const updated = await habit.save();
  res.json(updated);
});

// @desc    Delete a habit and all its completion records
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  await HabitCompletion.deleteMany({ habit: habit._id, user: req.userId });
  await habit.deleteOne();

  res.json({ message: 'Habit deleted successfully', _id: req.params.id });
});

module.exports = { getHabits, getHabitById, createHabit, updateHabit, deleteHabit };