const mongoose = require('mongoose');

const habitCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    date: {
      // Normalized to midnight UTC of the calendar day it represents
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    note: {
      // Optional short journal note for this habit on this day
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
);

// A habit can only have one completion record per calendar day
habitCompletionSchema.index({ habit: 1, date: 1 }, { unique: true });
habitCompletionSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('HabitCompletion', habitCompletionSchema);