/**
 * Seed script - creates a demo user with a handful of habits and several
 * weeks of randomized-but-plausible completion history, so the app has
 * real data to show immediately.
 *
 * Guarded to only run when explicitly invoked:
 *   node utils/seed.js
 * (or `npm run seed` from server/)
 *
 * This file does NOT run automatically on server start.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const { normalizeDate, isHabitScheduledOnDate } = require('./analyticsUtils');

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'Demo1234';
const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_DAYS = 42; // 6 weeks of history

const demoHabits = [
  {
    name: 'Drink 2L Water',
    description: 'Stay hydrated throughout the day',
    icon: '💧',
    color: '#0ea5e9',
    frequency: 'Daily',
    goal: 1,
    reminderTime: '09:00',
    completionRate: 0.85,
  },
  {
    name: 'Practice Coding',
    description: 'Work on personal projects or learning',
    icon: '💻',
    color: '#6366f1',
    frequency: 'Weekdays',
    goal: 1,
    reminderTime: '19:00',
    completionRate: 0.75,
  },
  {
    name: 'Gym Workout',
    description: 'Strength training or cardio session',
    icon: '🏋️',
    color: '#f97316',
    frequency: 'Custom',
    customDays: [1, 3, 5],
    goal: 1,
    reminderTime: '07:00',
    completionRate: 0.7,
  },
  {
    name: 'Read 20 Pages',
    description: 'Read a book, no screens',
    icon: '📚',
    color: '#22c55e',
    frequency: 'Daily',
    goal: 1,
    reminderTime: '21:00',
    completionRate: 0.65,
  },
  {
    name: 'Meditation',
    description: '10 minutes of mindfulness',
    icon: '🧘',
    color: '#a855f7',
    frequency: 'Daily',
    goal: 1,
    reminderTime: '06:30',
    completionRate: 0.6,
  },
  {
    name: 'Sleep Before 11 PM',
    description: 'Wind down and get consistent rest',
    icon: '😴',
    color: '#14b8a6',
    frequency: 'Daily',
    goal: 1,
    reminderTime: '22:30',
    completionRate: 0.55,
  },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing demo data...');
  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    const existingHabits = await Habit.find({ user: existingUser._id });
    const habitIds = existingHabits.map((h) => h._id);
    await HabitCompletion.deleteMany({ habit: { $in: habitIds } });
    await Habit.deleteMany({ user: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
  }

  console.log('Creating demo user...');
  const user = await User.create({
    name: 'Demo User',
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  const today = normalizeDate(new Date());
  const startDate = new Date(today.getTime() - HISTORY_DAYS * DAY_MS);

  console.log('Creating demo habits...');
  const createdHabits = [];
  for (const h of demoHabits) {
    const habit = await Habit.create({
      user: user._id,
      name: h.name,
      description: h.description,
      icon: h.icon,
      color: h.color,
      frequency: h.frequency,
      customDays: h.customDays || [],
      startDate,
      goal: h.goal,
      reminderTime: h.reminderTime,
    });
    createdHabits.push({ habit, completionRate: h.completionRate });
  }

  console.log('Generating completion history...');
  const completionDocs = [];
  for (const { habit, completionRate } of createdHabits) {
    for (let i = 0; i <= HISTORY_DAYS; i += 1) {
      const date = normalizeDate(new Date(startDate.getTime() + i * DAY_MS));
      if (date > today) continue;
      if (!isHabitScheduledOnDate(habit, date)) continue;

      // Slightly bias recent days to be more consistent (habit "improving") for a nicer demo
      const recencyBoost = i / HISTORY_DAYS > 0.7 ? 0.15 : 0;
      const didComplete = Math.random() < Math.min(completionRate + recencyBoost, 0.97);

      completionDocs.push({
        user: user._id,
        habit: habit._id,
        date,
        completed: didComplete,
      });
    }
  }

  await HabitCompletion.insertMany(completionDocs);

  console.log('\nSeed complete!');
  console.log('----------------------------------------');
  console.log(`Demo login email:    ${DEMO_EMAIL}`);
  console.log(`Demo login password: ${DEMO_PASSWORD}`);
  console.log(`Habits created:      ${createdHabits.length}`);
  console.log(`Completion records:  ${completionDocs.length}`);
  console.log('----------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
