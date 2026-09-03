import { Sprout, Flame, Zap, Medal, Award, Trophy, Crown } from 'lucide-react';

/**
 * Streak milestones for the achievement badges. A badge is "earned" once the
 * user's best-ever combined streak has reached that many days - it stays
 * earned even if the current streak later resets, since it's a record of
 * something already accomplished.
 *
 * `icon` is a lucide-react component (not an emoji) - render it as
 * <m.icon size={..} />.
 */
export const STREAK_MILESTONES = [
  { days: 3, label: 'Getting Started', icon: Sprout },
  { days: 7, label: '1 Week Streak', icon: Flame },
  { days: 14, label: '2 Week Streak', icon: Zap },
  { days: 30, label: '1 Month Streak', icon: Medal },
  { days: 60, label: '2 Month Streak', icon: Award },
  { days: 100, label: '100 Day Streak', icon: Trophy },
  { days: 365, label: '1 Year Streak', icon: Crown },
];

/** Returns { earned: [...], next: {...} | null, progress: 0-100 } for a given best streak. */
export const getAchievementProgress = (bestStreak = 0) => {
  const earned = STREAK_MILESTONES.filter((m) => bestStreak >= m.days);
  const next = STREAK_MILESTONES.find((m) => bestStreak < m.days) || null;
  const prevThreshold = earned.length > 0 ? earned[earned.length - 1].days : 0;
  const progress = next
    ? Math.round(((bestStreak - prevThreshold) / (next.days - prevThreshold)) * 100)
    : 100;
  return { earned, next, progress };
};