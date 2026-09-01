/**
 * Color system for data encoding, per the dataviz skill's method:
 * - ACCENT is the single UI brand color (buttons, active nav, focus rings,
 *   progress bars, and single-series chart marks / sequential ramps).
 * - CATEGORICAL_PALETTE is a fixed-order, CVD-validated 8-hue set used only
 *   for per-habit identity (same habit = same color everywhere: cards, the
 *   week strip, the calendar day panel, and the habit-performance chart).
 * - STATUS colors are reserved for completed/missed state, never reused as
 *   a series color, and always paired with an icon + label.
 */

export const ACCENT = {
  light: '#6366f1',
  dark: '#818cf8',
};

// Fixed-order categorical palette (validated: adjacent-pair CVD Delta E and
// normal-vision floor both clear the dataviz skill's gates in both modes).
export const CATEGORICAL_PALETTE = [
  { name: 'Blue', light: '#2a78d6', dark: '#3987e5' },
  { name: 'Orange', light: '#eb6834', dark: '#d95926' },
  { name: 'Aqua', light: '#1baf7a', dark: '#199e70' },
  { name: 'Yellow', light: '#eda100', dark: '#c98500' },
  { name: 'Magenta', light: '#e87ba4', dark: '#d55181' },
  { name: 'Green', light: '#008300', dark: '#008300' },
  { name: 'Violet', light: '#4a3aa7', dark: '#9085e9' },
  { name: 'Red', light: '#e34948', dark: '#e66767' },
];

const LIGHT_BY_HEX = new Map(CATEGORICAL_PALETTE.map((c) => [c.light.toLowerCase(), c]));

/**
 * Resolves a stored habit color (always the palette's light hex) to the hex
 * that should actually render in the current mode, so the same habit reads
 * as the same identity in both themes instead of a flat re-tint.
 */
export const resolveSeriesColor = (storedHex, isDark) => {
  if (!storedHex) return isDark ? ACCENT.dark : ACCENT.light;
  const match = LIGHT_BY_HEX.get(storedHex.toLowerCase());
  if (match) return isDark ? match.dark : match.light;
  return storedHex; // unrecognized/custom hex - render as-is
};

export const STATUS = {
  good: { light: '#16a34a', dark: '#22c55e' },
  warning: { light: '#d97706', dark: '#f59e0b' },
  critical: { light: '#dc2626', dark: '#f87171' },
};

// Single-hue (indigo) sequential ramp, light -> dark, used for the calendar
// heatmap's magnitude encoding. The dark column anchors the opposite way
// (low value sits near the dark surface, high value is the brightest step)
// so "more" still reads as "more saturated," never as "brighter than the page."
export const SEQUENTIAL_RAMP = {
  none: { light: '#f1f5f9', dark: '#1f1f23' }, // no habits scheduled (neutral, not on the ramp)
  light: [
    '#eef2ff', // 0%
    '#c7d2fe', // ~1-39%
    '#818cf8', // ~40-69%
    '#6366f1', // ~70-99%
    '#4338ca', // 100%
  ],
  dark: [
    '#26263a', // 0% - near the dark surface
    '#3b3a6b', // ~1-39%
    '#5b52c9', // ~40-69%
    '#818cf8', // ~70-99%
    '#a5b4fc', // 100% - brightest step
  ],
};

/** Picks readable ink (white or near-black) for text/icons sitting on a filled hex. */
export const getContrastText = (hex) => {
  if (!hex) return '#0b0b0b';
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // Relative luminance (sRGB approximation, cheap and good enough for this use)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0b0b0b' : '#ffffff';
};

/** Buckets a completion percent (0-100) into one of the ramp's 5 steps. */
export const sequentialStepIndex = (percent) => {
  if (percent <= 0) return 0;
  if (percent < 40) return 1;
  if (percent < 70) return 2;
  if (percent < 100) return 3;
  return 4;
};
