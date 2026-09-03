import { resolveSeriesColor } from '../../utils/colors';
import useTheme from '../../hooks/useTheme';
import { HabitIconBadge } from '../../utils/habitIcons';

/**
 * Overall month-progress summary for the Habits grid: a ring showing the
 * aggregate completion % across every habit for the selected month, plus a
 * "top habit" highlight - both computed client-side from data already
 * loaded for the grid (no extra API calls).
 */
export default function MonthProgressSummary({ percent, completed, scheduled, topHabit, monthLabel }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  const ringColor = isDark ? '#818cf8' : '#6366f1';
  const trackColor = isDark ? '#27273a' : '#eef2ff';
  const topColor = topHabit ? resolveSeriesColor(topHabit.habit.color, isDark) : ringColor;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="relative shrink-0">
          <svg width="88" height="88" viewBox="0 0 96 96" className="-rotate-90">
            <circle cx="48" cy="48" r={radius} fill="none" stroke={trackColor} strokeWidth="10" />
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{percent}%</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{monthLabel} progress</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {completed} of {scheduled} scheduled habit-days completed
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        {topHabit && topHabit.scheduled > 0 ? (
          <>
            <HabitIconBadge emoji={topHabit.habit.icon} color={topColor} size={48} />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Top habit this month</p>
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {topHabit.habit.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{topHabit.percent}% completion</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">No scheduled habits yet this month</p>
        )}
      </div>
    </div>
  );
}