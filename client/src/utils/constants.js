import { CATEGORICAL_PALETTE } from './colors';

export const EMOJI_OPTIONS = [
  '💧', '🏋️', '📚', '💻', '📖', '🧘', '😴', '🚶',
  '🥗', '🏃', '🚴', '🎨', '✍️', '🎸', '🧹', '🧑‍🍳',
  '🌱', '💊', '📵', '🚭', '🧑‍💼', '🎯', '☀️', '✅',
];

// Habit color swatches: the dataviz-validated categorical palette, so every
// habit's chosen color stays distinct and consistent (light & dark hex) app-wide.
export const COLOR_OPTIONS = CATEGORICAL_PALETTE.map((c) => ({ name: c.name, value: c.light }));

export const FREQUENCY_OPTIONS = ['Daily', 'Weekdays', 'Weekends', 'Custom'];

// Single category per habit (not a multi-tag system) - keeps filtering and
// the model simple. Matches server/models/Habit.js's enum exactly.
export const CATEGORY_OPTIONS = [
  { value: 'Health', icon: '❤️' },
  { value: 'Fitness', icon: '💪' },
  { value: 'Work', icon: '💼' },
  { value: 'Learning', icon: '📚' },
  { value: 'Mindfulness', icon: '🧘' },
  { value: 'Finance', icon: '💰' },
  { value: 'Social', icon: '🤝' },
  { value: 'Other', icon: '🏷️' },
];