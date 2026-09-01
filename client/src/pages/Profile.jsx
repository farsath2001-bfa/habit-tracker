import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Check, X, Flame, Trophy, ListChecks, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStreakAnalytics } from '../services/analyticsService';
import { getErrorMessage } from '../services/api';
import Avatar from '../components/common/Avatar';
import { formatFriendlyDate } from '../utils/dateUtils';
import { StatCardSkeleton } from '../components/common/Skeleton';
import Spinner from '../components/common/Spinner';

export default function Profile() {
  const { user, updateProfile, getErrorMessage: authErrorMessage } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try {
        const data = await getStreakAnalytics();
        setStats(data);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Could not load profile stats'));
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  const handleSaveName = async () => {
    if (!nameDraft.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingName(true);
    try {
      await updateProfile({ name: nameDraft.trim() });
      toast.success('Name updated successfully');
      setEditingName(false);
    } catch (err) {
      toast.error(authErrorMessage(err, 'Could not update your name'));
    } finally {
      setSavingName(false);
    }
  };

  const validatePasswordForm = () => {
    const next = {};
    if (!pwForm.currentPassword) next.currentPassword = 'Current password is required';
    if (pwForm.newPassword.length < 6) next.newPassword = 'New password must be at least 6 characters';
    if (pwForm.confirmPassword !== pwForm.newPassword) next.confirmPassword = 'Passwords do not match';
    setPwErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setSavingPw(true);
    try {
      await updateProfile({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      toast.error(authErrorMessage(err, 'Could not change your password'));
    } finally {
      setSavingPw(false);
    }
  };

  const totalHabits = stats?.habits?.length ?? 0;
  const totalCompleted = stats?.overall?.totalCompleted ?? 0;
  const bestStreak = stats?.overall?.bestStreak ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account details and see your all-time stats
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar name={user?.name} size="xl" ring />
          <div className="flex-1 text-center sm:text-left">
            {editingName ? (
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 disabled:opacity-60"
                  aria-label="Save name"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(false);
                    setNameDraft(user?.name || '');
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                  aria-label="Edit name"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Member since {user?.createdAt ? formatFriendlyDate(user.createdAt) : '—'}
            </p>
          </div>
        </div>

        {loadingStats ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 text-center transition-colors duration-150 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800">
              <ListChecks className="mx-auto mb-1 text-indigo-500" size={20} />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{totalHabits}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Habits</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center transition-colors duration-150 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800">
              <CheckCircle2 className="mx-auto mb-1 text-emerald-500" size={20} />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{totalCompleted}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Completed</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center transition-colors duration-150 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800">
              <Trophy className="mx-auto mb-1 text-amber-500" size={20} />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{bestStreak}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Best Streak</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
          <Flame size={18} className="text-orange-500" /> Change Password
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Choose a strong password you're not using elsewhere.
        </p>
        <div className="mb-5 border-t border-slate-100 dark:border-slate-800" />
        <form onSubmit={handleChangePassword} noValidate className="max-w-md space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Current password
            </label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:text-white ${
                pwErrors.currentPassword ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {pwErrors.currentPassword && (
              <p className="mt-1 text-xs text-rose-500">{pwErrors.currentPassword}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              New password
            </label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:text-white ${
                pwErrors.newPassword ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {pwErrors.newPassword && <p className="mt-1 text-xs text-rose-500">{pwErrors.newPassword}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Confirm new password
            </label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:text-white ${
                pwErrors.confirmPassword ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {pwErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-500">{pwErrors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={savingPw}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            {savingPw && <Spinner size="xs" tone="white" />}
            {savingPw ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
