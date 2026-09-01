import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Flame, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import * as habitService from '../services/habitService';
import * as completionService from '../services/completionService';
import {
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getStreakAnalytics,
} from '../services/analyticsService';
import { getErrorMessage } from '../services/api';
import { buildReportRows } from '../utils/exportUtils';
import { resolveSeriesColor } from '../utils/colors';
import { STAT_COLORS } from '../utils/statColors';
import useTheme from '../hooks/useTheme';
import WeeklyChart from '../components/analytics/WeeklyChart';
import MonthlyChart from '../components/analytics/MonthlyChart';
import HabitPerformanceChart from '../components/analytics/HabitPerformanceChart';
import ExportMenu from '../components/analytics/ExportMenu';
import StatCard from '../components/dashboard/StatCard';
import EmptyState from '../components/common/EmptyState';
import { AnalyticsSkeleton } from '../components/common/Skeleton';

export default function Analytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState(null);
  const [streaks, setStreaks] = useState({ habits: [], overall: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const now = new Date();
      const [habitList, completionList, weeklyData, monthlyData, streakData] = await Promise.all([
        habitService.getHabits(),
        completionService.getCompletions({}),
        getWeeklyAnalytics(),
        getMonthlyAnalytics(now.getFullYear(), now.getMonth()),
        getStreakAnalytics(),
      ]);
      setHabits(habitList);
      setCompletions(completionList);
      setWeekly(weeklyData);
      setMonthly(monthlyData);
      setStreaks(streakData);
    } catch (err) {
      const message = getErrorMessage(err, 'Could not load analytics');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <AnalyticsSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
        {error}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No analytics yet"
        description="Create a few habits and start checking them off to see your trends here."
      />
    );
  }

  const reportRows = buildReportRows(habits, completions, streaks);
  const overall = streaks.overall || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Dive into your trends, streaks and habit performance
          </p>
        </div>
        <ExportMenu rows={reportRows} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current Streak" value={overall.currentStreak ?? 0} suffix=" days" icon={<Flame size={18} />} accent={STAT_COLORS.streak} />
        <StatCard label="Longest Streak" value={overall.bestStreak ?? 0} suffix=" days" icon={<Trophy size={18} />} accent={STAT_COLORS.best} />
        <StatCard label="Total Completed" value={overall.totalCompleted ?? 0} icon={<CheckCircle2 size={18} />} accent={STAT_COLORS.total} />
        <StatCard label="Total Missed" value={overall.totalMissed ?? 0} icon={<XCircle size={18} />} accent={STAT_COLORS.missed} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
            This Week
          </h2>
          <WeeklyChart data={weekly} />
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
            This Month
          </h2>
          <MonthlyChart data={monthly?.days} />
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
          Habit Performance
        </h2>
        <HabitPerformanceChart data={streaks.habits} />
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
          Streak Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="py-2 pr-4 font-medium">Habit</th>
                <th className="py-2 pr-4 font-medium">Current</th>
                <th className="py-2 pr-4 font-medium">Best</th>
                <th className="py-2 pr-4 font-medium">Completed</th>
                <th className="py-2 pr-4 font-medium">Missed</th>
                <th className="py-2 pr-4 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {(streaks.habits || []).map((h) => (
                <tr
                  key={h.habitId}
                  className="border-b border-slate-50 transition-colors duration-150 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                >
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: resolveSeriesColor(h.color, isDark) }}
                        aria-hidden="true"
                      />
                      {h.icon} {h.name}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{h.currentStreak}</td>
                  <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{h.bestStreak}</td>
                  <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{h.totalCompleted}</td>
                  <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{h.totalMissed}</td>
                  <td className="py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-200">{h.completionPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
