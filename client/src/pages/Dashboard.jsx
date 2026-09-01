import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Flame, Trophy, Sprout, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardAnalytics } from '../services/analyticsService';
import { getErrorMessage } from '../services/api';
import { getGreeting, formatFriendlyDate } from '../utils/dateUtils';
import { STAT_COLORS } from '../utils/statColors';
import StatCard from '../components/dashboard/StatCard';
import TrendChart from '../components/dashboard/TrendChart';
import GreetingBanner from '../components/dashboard/GreetingBanner';
import AchievementBadges from '../components/dashboard/AchievementBadges';
import EmptyState from '../components/common/EmptyState';
import { DashboardSkeleton } from '../components/common/Skeleton';

const motivationalLines = [
  "Small steps every day add up to big changes.",
  "Consistency beats intensity. Keep showing up.",
  "You're building the person you want to become.",
  "Progress, not perfection.",
  "One habit at a time, one day at a time.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getDashboardAnalytics();
        if (mounted) setData(result);
      } catch (err) {
        const message = getErrorMessage(err, 'Could not load your dashboard');
        if (mounted) setError(message);
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const line = motivationalLines[new Date().getDate() % motivationalLines.length];
  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="space-y-6">
        <GreetingBanner
          greeting={getGreeting()}
          firstName={firstName}
          dateLabel={formatFriendlyDate(new Date())}
          line={line}
        />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GreetingBanner
        greeting={getGreeting()}
        firstName={firstName}
        dateLabel={formatFriendlyDate(new Date())}
        line={line}
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {!error && data && data.totalHabits === 0 && (
        <EmptyState
          icon="🌱"
          title="Start Building Your Better Routine"
          description="You haven't created any habits yet. Add your first habit to start tracking streaks and progress."
          action={
            <Link
              to="/habits"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md active:translate-y-0"
            >
              <Plus size={16} /> Create Habit
            </Link>
          }
        />
      )}

      {!error && data && data.totalHabits > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Today's Progress"
              value={data.todayCompletionPercent}
              suffix="%"
              icon={<TrendingUp size={18} />}
              accent={STAT_COLORS.progress}
              progress={data.todayCompletionPercent}
            />
            <StatCard
              label="Current Streak"
              value={data.currentStreak}
              suffix={` ${data.currentStreak === 1 ? 'day' : 'days'} 🔥`}
              icon={<Flame size={18} />}
              accent={STAT_COLORS.streak}
            />
            <StatCard
              label="Best Streak"
              value={data.bestStreak}
              suffix={` ${data.bestStreak === 1 ? 'day' : 'days'} 🏆`}
              icon={<Trophy size={18} />}
              accent={STAT_COLORS.best}
            />
            <StatCard
              label="Total Habits"
              value={data.totalHabits}
              suffix=" 🌱"
              icon={<Sprout size={18} />}
              accent={STAT_COLORS.total}
            />
          </div>

          <AchievementBadges bestStreak={data.bestStreak} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Last 14 days
              </h2>
              <Link to="/analytics" className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                View full analytics →
              </Link>
            </div>
            <TrendChart data={data.recentTrend} />
          </div>
        </>
      )}
    </div>
  );
}