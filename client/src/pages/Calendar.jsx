import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as habitService from '../services/habitService';
import * as completionService from '../services/completionService';
import { getMonthlyAnalytics } from '../services/analyticsService';
import { getErrorMessage } from '../services/api';
import { toDateKey, isHabitScheduledOnDate } from '../utils/dateUtils';
import Heatmap from '../components/calendar/Heatmap';
import DayPanel from '../components/calendar/DayPanel';
import { CalendarSkeleton } from '../components/common/Skeleton';
import useLocalStorage from '../hooks/useLocalStorage';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [startDayLabel] = useLocalStorage('habit_tracker_start_day', 'Sunday');
  const startDay = startDayLabel === 'Monday' ? 1 : 0;

  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const monthStart = new Date(Date.UTC(year, month, 1));
      const monthEnd = new Date(Date.UTC(year, month + 1, 0));
      const [habitList, completionList, monthly] = await Promise.all([
        habitService.getHabits(),
        completionService.getCompletions({
          from: toDateKey(monthStart),
          to: toDateKey(monthEnd),
        }),
        getMonthlyAnalytics(year, month),
      ]);
      setHabits(habitList);
      setCompletions(completionList);
      setMonthlyData(monthly);
    } catch (err) {
      const message = getErrorMessage(err, 'Could not load the calendar');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
    setSelectedDateKey(null);
  }, [load]);

  const goToPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const selectedDayInfo = useMemo(() => {
    if (!selectedDateKey) return { habitsForDay: [], percent: 0 };

    const dayCompletions = completions.filter((c) => toDateKey(c.date) === selectedDateKey);
    const completedSet = new Set(
      dayCompletions.filter((c) => c.completed).map((c) => String(c.habit))
    );
    const notesByHabitId = new Map(
      dayCompletions.filter((c) => c.note).map((c) => [String(c.habit), c.note])
    );

    const scheduledHabits = habits.filter((h) => isHabitScheduledOnDate(h, selectedDateKey));

    const habitsForDay = scheduledHabits.map((h) => ({
      habitId: h._id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      completed: completedSet.has(String(h._id)),
      note: notesByHabitId.get(String(h._id)) || '',
    }));

    const percent =
      scheduledHabits.length === 0
        ? 100
        : Math.round(
            (habitsForDay.filter((h) => h.completed).length / scheduledHabits.length) * 100
          );

    return { habitsForDay, percent };
  }, [selectedDateKey, habits, completions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A GitHub-style view of your daily completion history
        </p>
      </div>

      {loading ? (
        <CalendarSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {MONTH_NAMES[month]} {year}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  disabled={isCurrentMonth}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <Heatmap
              year={year}
              month={month}
              dayData={monthlyData?.days}
              onSelectDay={setSelectedDateKey}
              selectedDateKey={selectedDateKey}
              startDay={startDay}
            />
          </div>

          <div>
            {selectedDateKey ? (
              <DayPanel
                dateKey={selectedDateKey}
                habitsForDay={selectedDayInfo.habitsForDay}
                percent={selectedDayInfo.percent}
                onClose={() => setSelectedDateKey(null)}
              />
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                <span className="text-2xl">📅</span>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Click a day on the calendar to see details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}