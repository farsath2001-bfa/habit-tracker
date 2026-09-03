import { Lock, PartyPopper } from 'lucide-react';
import { STREAK_MILESTONES, getAchievementProgress } from '../../utils/achievements';
import { ACCENT } from '../../utils/colors';
import useTheme from '../../hooks/useTheme';

/**
 * Row of streak-milestone badges. Earned badges (bestStreak has reached that
 * milestone at least once) render filled and in color; the rest sit locked
 * and grayed out. The very next unearned badge shows a thin progress bar
 * toward it, so there's always a visible "next thing to reach for."
 */
export default function AchievementBadges({ bestStreak = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const accent = isDark ? ACCENT.dark : ACCENT.light;
  const { next, progress } = getAchievementProgress(bestStreak);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Achievements</h2>
        <span className="text-xs text-slate-400">Based on your best-ever streak</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {STREAK_MILESTONES.map((m) => {
          const earned = bestStreak >= m.days;
          const isNext = next && next.days === m.days;

          return (
            <div key={m.days} className="flex w-20 shrink-0 flex-col items-center gap-2">
              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 ${
                  earned ? 'scale-100' : 'scale-95 opacity-50'
                }`}
                style={{
                  backgroundColor: earned ? `${accent}1f` : undefined,
                  border: earned ? `2px solid ${accent}` : undefined,
                  color: earned ? accent : undefined,
                }}
                title={`${m.label}${earned ? ' - earned' : ` - reach a ${m.days}-day streak`}`}
              >
                {earned ? (
                  <m.icon size={22} />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600">
                    <Lock size={16} />
                  </span>
                )}
              </div>
              <span className="text-center text-[11px] font-medium leading-tight text-slate-500 dark:text-slate-400">
                {m.days}d
              </span>
              {isNext && (
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, progress)}%`, backgroundColor: accent }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {next && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {next.days - bestStreak} more {next.days - bestStreak === 1 ? 'day' : 'days'} to unlock{' '}
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
            <next.icon size={14} /> {next.label}
          </span>
        </p>
      )}
      {!next && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <PartyPopper size={14} className="text-amber-500" /> You've earned every badge - incredible consistency.
        </p>
      )}
    </div>
  );
}