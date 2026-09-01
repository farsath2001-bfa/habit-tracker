import { useState } from 'react';
import { Pencil, Trash2, Flame, Check } from 'lucide-react';
import WeekStrip from './WeekStrip';
import ProgressBar from '../common/ProgressBar';
import useTheme from '../../hooks/useTheme';
import { resolveSeriesColor } from '../../utils/colors';

export default function HabitCard({
  habit,
  completionKeysForHabit,
  completedToday,
  streak,
  onToggleToday,
  onEdit,
  onDelete,
  toggling,
}) {
  const [justPopped, setJustPopped] = useState(false);
  const { theme } = useTheme();
  const color = resolveSeriesColor(habit.color, theme === 'dark');
  const currentStreak = streak?.currentStreak ?? 0;
  const completionPercent = streak?.completionPercent ?? 0;

  const handleToggle = () => {
    if (!completedToday) {
      setJustPopped(true);
      setTimeout(() => setJustPopped(false), 400);
    }
    onToggleToday(habit);
  };

  return (
    <div className="fade-in group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ring-1 ring-inset"
            style={{ backgroundColor: `${color}1f`, color, '--tw-ring-color': `${color}33` }}
          >
            {habit.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900 dark:text-white">{habit.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{habit.frequency}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            aria-label="Edit habit"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            aria-label="Delete habit"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {habit.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-orange-500">
        <Flame size={15} />
        {currentStreak} day{currentStreak === 1 ? '' : 's'} streak
      </div>

      <div className="mt-3">
        <WeekStrip completionKeys={completionKeysForHabit} color={color} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Completion rate</span>
          <span>{completionPercent}%</span>
        </div>
        <ProgressBar percent={completionPercent} color={color} />
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className={`relative mt-5 flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${
          completedToday
            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        } ${justPopped ? 'pop-in' : ''}`}
      >
        {completedToday ? (
          <>
            <Check size={16} className={justPopped ? 'check-pop' : ''} strokeWidth={3} /> Completed
          </>
        ) : (
          'Mark Complete'
        )}
      </button>
    </div>
  );
}
