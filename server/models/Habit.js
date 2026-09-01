const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a habit name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: '✅',
    },
    color: {
      type: String,
      default: '#6366f1', // indigo-500
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekdays', 'Weekends', 'Custom'],
      default: 'Daily',
    },
    customDays: {
      // 0 = Sunday ... 6 = Saturday, only used when frequency === 'Custom'
      type: [Number],
      default: [],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    goal: {
      type: Number,
      default: 1,
      min: 1,
    },
    reminderTime: {
      type: String,
      default: '',
    },
    archived: {
      // Paused habits stay in the database (history intact) but drop out of
      // the active grid/scheduling/streak-building until restored.
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['Health', 'Fitness', 'Work', 'Learning', 'Mindfulness', 'Finance', 'Social', 'Other'],
      default: 'Other',
    },
  },
  { timestamps: true }
);

habitSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Habit', habitSchema);