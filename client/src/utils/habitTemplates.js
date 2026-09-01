import { CATEGORICAL_PALETTE } from './colors';

/**
 * Preset "quick start" habits offered in the create-habit form. Icons are
 * drawn from EMOJI_OPTIONS and categories from CATEGORY_OPTIONS so a
 * template's values always match something selectable in the form; colors
 * cycle through the categorical palette for visual variety in the gallery.
 */
const c = (i) => CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length].light;

export const HABIT_TEMPLATES = [
  { name: 'Drink 2L Water', icon: '💧', color: c(0), category: 'Health', frequency: 'Daily', goal: 1 },
  { name: 'Read 20 Pages', icon: '📖', color: c(1), category: 'Learning', frequency: 'Daily', goal: 1 },
  { name: 'Morning Walk', icon: '🚶', color: c(2), category: 'Fitness', frequency: 'Daily', goal: 1 },
  { name: 'Meditate 10 Minutes', icon: '🧘', color: c(3), category: 'Mindfulness', frequency: 'Daily', goal: 1 },
  { name: 'Gym Workout', icon: '🏋️', color: c(4), category: 'Fitness', frequency: 'Weekdays', goal: 1 },
  { name: 'Sleep Before 11 PM', icon: '😴', color: c(5), category: 'Health', frequency: 'Daily', goal: 1 },
  { name: 'Eat a Healthy Meal', icon: '🥗', color: c(6), category: 'Health', frequency: 'Daily', goal: 1 },
  { name: 'Practice Coding', icon: '💻', color: c(7), category: 'Learning', frequency: 'Weekdays', goal: 1 },
  { name: 'Journal', icon: '✍️', color: c(0), category: 'Mindfulness', frequency: 'Daily', goal: 1 },
  { name: 'Take Vitamins', icon: '💊', color: c(1), category: 'Health', frequency: 'Daily', goal: 1 },
  { name: 'Morning Run', icon: '🏃', color: c(2), category: 'Fitness', frequency: 'Weekdays', goal: 1 },
  { name: 'Tidy Up', icon: '🧹', color: c(3), category: 'Other', frequency: 'Weekends', goal: 1 },
];