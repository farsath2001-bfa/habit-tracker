import {
  Droplet,
  Dumbbell,
  BookOpen,
  Laptop,
  Book,
  Flower2,
  Moon,
  Footprints,
  Salad,
  Zap,
  Bike,
  Palette,
  PenLine,
  Music2,
  Sparkles,
  ChefHat,
  Sprout,
  Pill,
  PhoneOff,
  Ban,
  Briefcase,
  Target,
  Sun,
  CheckCircle2,
  Heart,
  PiggyBank,
  Handshake,
  Tag,
} from 'lucide-react';

/**
 * Maps every emoji offered in EMOJI_OPTIONS / CATEGORY_OPTIONS (constants.js)
 * to a real lucide-react icon component, for on-screen display only.
 *
 * The emoji character itself is still what's actually saved on a habit
 * (habit.icon) or picked for a category - zero backend/data-model change,
 * zero migration for existing habits. This is purely a display-layer
 * lookup: wherever the UI shows a habit's icon, look the stored emoji up
 * here and render the matching vector icon instead of the raw glyph.
 *
 * Two places intentionally keep the plain emoji character instead of this
 * lookup, because they technically can't render a React component:
 *  - native <select><option> elements (the Category dropdowns in
 *    HabitFormModal and the Habits page filter bar) - browsers only allow
 *    plain text inside <option>, not arbitrary markup
 *  - non-React, text-only outputs: the monthly PDF report, CSV export,
 *    the analytics chart's axis labels, and browser push-notification
 *    titles
 */
const EMOJI_ICON_MAP = {
  // Habit icons (EMOJI_OPTIONS)
  '💧': Droplet,
  '🏋️': Dumbbell,
  '📚': BookOpen,
  '💻': Laptop,
  '📖': Book,
  '🧘': Flower2,
  '😴': Moon,
  '🚶': Footprints,
  '🥗': Salad,
  '🏃': Zap,
  '🚴': Bike,
  '🎨': Palette,
  '✍️': PenLine,
  '🎸': Music2,
  '🧹': Sparkles,
  '🧑‍🍳': ChefHat,
  '🌱': Sprout,
  '💊': Pill,
  '📵': PhoneOff,
  '🚭': Ban,
  '🧑‍💼': Briefcase,
  '🎯': Target,
  '☀️': Sun,
  '✅': CheckCircle2,
  // Category icons (CATEGORY_OPTIONS) - a few overlap with the ones above
  '❤️': Heart,
  '💪': Dumbbell,
  '💼': Briefcase,
  '💰': PiggyBank,
  '🤝': Handshake,
  '🏷️': Tag,
};

/** Real icon component for a stored emoji; falls back to Tag if unmapped. */
export const getHabitIconComponent = (emoji) => EMOJI_ICON_MAP[emoji] || Tag;

/** Bare icon, no background - drop-in replacement for rendering `{habit.icon}` as text. */
export function HabitIcon({ emoji, size = 16, className = '', style }) {
  const Icon = getHabitIconComponent(emoji);
  return <Icon size={size} className={className} style={style} />;
}

/**
 * Icon inside a colored circular badge - the pattern repeated across the
 * habit grid, archived list, month summary card, and calendar day panel.
 * `size` is the badge diameter in px; `iconSize` defaults to ~55% of it.
 */
export function HabitIconBadge({ emoji, color, size = 32, iconSize, alpha = '1f', className = '' }) {
  const Icon = getHabitIconComponent(emoji);
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size, backgroundColor: `${color}${alpha}`, color }}
    >
      <Icon size={iconSize ?? Math.round(size * 0.55)} />
    </span>
  );
}