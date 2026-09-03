import { RotateCcw, Trash2 } from 'lucide-react';
import { resolveSeriesColor } from '../../utils/colors';
import useTheme from '../../hooks/useTheme';
import { HabitIconBadge } from '../../utils/habitIcons';

/**
 * Read-only-ish list of paused habits: no grid, no toggling - just a name,
 * icon, and two actions (Restore / Delete permanently). History for an
 * archived habit is preserved in the database even though it's hidden from
 * the active grid and no longer counted in streaks/analytics.
 */
export default function ArchivedHabitsList({ habits, onRestore, onDelete }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (habits.length === 0) return null;

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/40">
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {habits.map((habit) => {
          const color = resolveSeriesColor(habit.color, isDark);
          return (
            <li key={habit._id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <HabitIconBadge emoji={habit.icon} color={color} size={32} className="opacity-70" />
                <span className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                  {habit.name}
                </span>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onRestore(habit)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors duration-150 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  <RotateCcw size={13} /> Restore
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(habit)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  aria-label="Delete permanently"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}