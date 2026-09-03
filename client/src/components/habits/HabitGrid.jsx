// client/src/components/habits/HabitGrid.jsx
import { Pencil, Trash2, Archive, StickyNote, Check } from 'lucide-react';
import useTheme from '../../hooks/useTheme';
import { resolveSeriesColor, getContrastText, SEQUENTIAL_RAMP, sequentialStepIndex } from '../../utils/colors';
import { isHabitScheduledOnDate, toDateKey } from '../../utils/dateUtils';
import { HabitIconBadge } from '../../utils/habitIcons';

/**
 * OMR/spreadsheet-style habit tracker grid: rows are habits, columns are
 * every day of the selected month. A cell is a colored square you click to
 * toggle that habit's completion for that day - the classic paper
 * habit-tracker layout, digitized.
 */
export default function HabitGrid({
  habits,
  days, // array of { day, dateKey }
  completionKeysByHabit, // Map<habitId, string[] of completed dateKeys>
  streaksByHabit, // Map<habitId, streak stats>
  onToggleDate,
  onEdit,
  onDelete,
  onArchive,
  togglingCell, // `${habitId}:${dateKey}` currently in flight, or null
  perDayStats, // optional: [{ dateKey, percent (0-100 or null if nothing scheduled) }] for the footer totals row
  notesByHabit, // optional: Map<habitId, Map<dateKey, note>>
  onEditNote, // optional: (habit, dateKey) => void
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const todayKey = toDateKey(new Date());
  const ramp = isDark ? SEQUENTIAL_RAMP.dark : SEQUENTIAL_RAMP.light;
  const noneColor = isDark ? SEQUENTIAL_RAMP.none.dark : SEQUENTIAL_RAMP.none.light;
  const perDayByKey = new Map((perDayStats || []).map((d) => [d.dateKey, d]));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="sticky left-0 z-10 min-w-[180px] bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                Habit
              </th>
              {days.map((d) => (
                <th
                  key={d.dateKey}
                  className={`min-w-[30px] px-0.5 py-2 text-center text-[11px] font-medium ${
                    d.dateKey === todayKey
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {d.day}
                </th>
              ))}
              <th className="min-w-[70px] px-3 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                Goal
              </th>
              <th className="min-w-[90px] px-3 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                Progress
              </th>
              <th className="min-w-[104px] px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const color = resolveSeriesColor(habit.color, isDark);
              const completedKeys = completionKeysByHabit.get(String(habit._id)) || new Set();
              const streak = streaksByHabit.get(String(habit._id));
              const percent = streak?.completionPercent ?? 0;

              return (
                <tr
                  key={habit._id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="sticky left-0 z-10 min-w-[180px] bg-white px-4 py-2.5 dark:bg-slate-900">
                    <div className="flex items-center gap-2.5">
                      <HabitIconBadge emoji={habit.icon} color={color} size={32} />
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-slate-800 dark:text-slate-100">
                          {habit.name}
                        </span>
                        {habit.category && habit.category !== 'Other' && (
                          <span className="block truncate text-[11px] leading-tight text-slate-400 dark:text-slate-500">
                            {habit.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {days.map((d) => {
                    const scheduled = isHabitScheduledOnDate(habit, d.dateKey);
                    const isFuture = d.dateKey > todayKey;
                    const isPast = d.dateKey < todayKey;
                    const isToday = d.dateKey === todayKey;
                    const completed = completedKeys.has(d.dateKey);
                    // Only "today" can be toggled - once a day passes it's
                    // locked, same as the future, so history can't be edited.
                    const disabled = !scheduled || isFuture || isPast;
                    const busy = togglingCell === `${habit._id}:${d.dateKey}`;
                    const noteForDay = notesByHabit?.get(String(habit._id))?.get(d.dateKey);
                    // Notes: addable/editable only on today's cell (same lock
                    // as completion); a past day's saved note is still shown,
                    // just read-only, so the journal history isn't hidden.
                    const showNoteDot = onEditNote && ((isToday && scheduled) || (isPast && noteForDay));

                    return (
                      <td key={d.dateKey} className="px-0.5 py-1.5 text-center">
                        <div className="relative mx-auto inline-block">
                          <button
                            type="button"
                            disabled={disabled || busy}
                            onClick={() => onToggleDate(habit, d.dateKey)}
                            title={
                              !scheduled
                                ? 'Not scheduled'
                                : isFuture
                                ? "Can't mark a future day"
                                : isPast
                                ? 'Past days are locked - only today can be edited'
                                : `${d.dateKey}${completed ? ' - completed' : ''}`
                            }
                            className={`mx-auto h-5 w-5 rounded-[5px] border transition-all duration-150 ${
                              disabled
                                ? 'cursor-not-allowed border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                                : 'cursor-pointer border-slate-200 hover:scale-110 hover:shadow-sm dark:border-slate-700'
                            } ${busy ? 'animate-pulse' : ''}`}
                            style={
                              completed && !disabled
                                ? { backgroundColor: color, borderColor: color }
                                : undefined
                            }
                          >
                            {completed && !disabled && (
                              <span
                                className="flex items-center justify-center"
                                style={{ color: getContrastText(color) }}
                              >
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                          </button>
                          {showNoteDot && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditNote(habit, d.dateKey);
                              }}
                              title={noteForDay ? (isToday ? 'Edit note' : 'View note') : 'Add a note'}
                              className={`absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full border border-white dark:border-slate-900 ${
                                noteForDay
                                  ? 'bg-amber-400 text-white'
                                  : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-400'
                              }`}
                            >
                              <StickyNote size={7} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  <td className="px-3 py-2.5 text-center text-slate-500 dark:text-slate-400">
                    {habit.goal || 1}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="w-9 shrink-0 text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                        {percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(habit)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                        aria-label="Edit habit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onArchive(habit)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
                        aria-label="Pause habit"
                        title="Pause this habit"
                      >
                        <Archive size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(habit)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        aria-label="Delete habit"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {perDayStats && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-700">
                <td className="sticky left-0 z-10 min-w-[180px] bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Daily total
                </td>
                {days.map((d) => {
                  const stat = perDayByKey.get(d.dateKey);
                  const percent = stat?.percent;
                  const hasData = percent !== null && percent !== undefined;
                  const fill = hasData ? ramp[sequentialStepIndex(percent)] : noneColor;
                  return (
                    <td key={d.dateKey} className="px-0.5 py-1.5 text-center">
                      <div
                        title={hasData ? `${percent}% completed` : 'No habits scheduled'}
                        className="mx-auto h-3 w-5 rounded-sm"
                        style={{ backgroundColor: fill }}
                      />
                    </td>
                  );
                })}
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}