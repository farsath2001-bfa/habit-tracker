import { X, Check, Circle } from 'lucide-react';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { resolveSeriesColor } from '../../utils/colors';
import useTheme from '../../hooks/useTheme';

export default function DayPanel({ dateKey, habitsForDay, percent, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!dateKey) return null;

  return (
    <div className="fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {formatFriendlyDate(dateKey)}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{percent}% complete</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {habitsForDay.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No habits were scheduled on this day.
        </p>
      )}

      <ul className="space-y-2">
        {habitsForDay.map((h) => {
          const color = resolveSeriesColor(h.color, isDark);
          return (
            <li
              key={h.habitId}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                  style={{ backgroundColor: `${color}1a`, color }}
                >
                  {h.icon}
                </span>
                <div className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {h.name}
                  </span>
                  {h.note && (
                    <span className="block truncate text-xs text-slate-400 dark:text-slate-500" title={h.note}>
                      "{h.note}"
                    </span>
                  )}
                </div>
              </div>
              {h.completed ? (
                <span
                  className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                  style={{ color: 'var(--status-good)', backgroundColor: 'color-mix(in srgb, var(--status-good) 12%, transparent)' }}
                >
                  <Check size={13} /> Completed
                </span>
              ) : (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <Circle size={13} /> Missed
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}