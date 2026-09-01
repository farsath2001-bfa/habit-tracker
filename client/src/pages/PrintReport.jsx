import { useEffect, useState } from 'react';
import * as habitService from '../services/habitService';
import * as completionService from '../services/completionService';
import { getStreakAnalytics } from '../services/analyticsService';
import { buildReportRows } from '../utils/exportUtils';
import { FullPageSpinner } from '../components/common/Spinner';
import { formatFriendlyDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

/** A print-friendly, dedicated view of the full habit report. Opened via window.print(). */
export default function PrintReport() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [overall, setOverall] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [habits, completions, streaks] = await Promise.all([
          habitService.getHabits(),
          completionService.getCompletions({}),
          getStreakAnalytics(),
        ]);
        setRows(buildReportRows(habits, completions, streaks));
        setOverall(streaks.overall || {});
      } catch (err) {
        setRows([]);
      }
    };
    load();
  }, []);

  if (rows === null) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-slate-900">
      <div className="no-print mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Print / Save as PDF
        </button>
      </div>

      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold">Habit Tracker Report</h1>
        <p className="text-sm text-slate-500">
          {user?.name ? `${user.name} · ` : ''}Generated {formatFriendlyDate(new Date())}
        </p>
      </header>

      <section className="mb-6 grid grid-cols-4 gap-4 text-center">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Current Streak</p>
          <p className="text-xl font-bold">{overall.currentStreak ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Best Streak</p>
          <p className="text-xl font-bold">{overall.bestStreak ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-xl font-bold">{overall.totalCompleted ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Missed</p>
          <p className="text-xl font-bold">{overall.totalMissed ?? 0}</p>
        </div>
      </section>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2 pr-3">Habit</th>
            <th className="py-2 pr-3">Date</th>
            <th className="py-2 pr-3">Completed</th>
            <th className="py-2 pr-3">Current Streak</th>
            <th className="py-2 pr-3">Best Streak</th>
            <th className="py-2 pr-3">Completion %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-1.5 pr-3">{r.habit}</td>
              <td className="py-1.5 pr-3">{r.date}</td>
              <td className="py-1.5 pr-3">{r.completed}</td>
              <td className="py-1.5 pr-3">{r.currentStreak}</td>
              <td className="py-1.5 pr-3">{r.bestStreak}</td>
              <td className="py-1.5 pr-3">{r.completionPercent}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && <p className="text-sm text-slate-500">No completion history yet.</p>}
    </div>
  );
}
