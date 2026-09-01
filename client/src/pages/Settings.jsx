import { useState } from 'react';
import { Sun, Moon, LogOut, KeyRound, ChevronRight, Bell, BellOff, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useTheme from '../hooks/useTheme';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import * as habitService from '../services/habitService';
import * as completionService from '../services/completionService';
import { getErrorMessage } from '../services/api';
import { buildHabitsCsv, downloadCsv } from '../utils/csvExport';
import { toDateKey } from '../utils/dateUtils';

function ToggleSwitch({ checked, onChange, onIcon, offIcon }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 shadow transition-transform duration-200 ease-out ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      >
        {checked ? onIcon : offIcon}
      </span>
    </button>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [startDay, setStartDay] = useLocalStorage('habit_tracker_start_day', 'Sunday');
  const [remindersEnabled, setRemindersEnabled] = useLocalStorage(
    'habit_tracker_reminders_enabled',
    false
  );
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleStartDayChange = (value) => {
    setStartDay(value);
    toast.success(`Week now starts on ${value}`);
  };

  const handleToggleReminders = async () => {
    if (remindersEnabled) {
      setRemindersEnabled(false);
      toast.success('Reminders turned off');
      return;
    }
    if (typeof Notification === 'undefined') {
      toast.error('Your browser does not support notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setRemindersEnabled(true);
      toast.success('Reminders enabled - set a reminder time on each habit to use them');
    } else {
      toast.error('Notifications are blocked - allow them for this site in your browser settings');
    }
  };

  // Fires an immediate notification, bypassing all the scheduling logic -
  // isolates whether the issue is permission/OS-level or something in the
  // reminder-time check itself.
  const handleTestNotification = () => {
    if (typeof Notification === 'undefined') {
      toast.error('This browser does not support notifications at all (common on mobile)');
      return;
    }
    if (Notification.permission !== 'granted') {
      toast.error('Not permitted yet - turn the toggle on above first');
      return;
    }
    try {
      new Notification('🔔 Test notification', {
        body: 'If you can see this, notifications work on this browser/device.',
      });
      toast.success('Sent - look for it now (check Do Not Disturb/Focus mode if you don\'t see it)');
    } catch (err) {
      toast.error('This browser/device cannot show notifications this way (common on mobile Chrome)');
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const habits = await habitService.getHabits();
      const completions = await completionService.getCompletions({
        from: '2000-01-01',
        to: toDateKey(new Date()),
      });
      if (completions.length === 0) {
        toast.error('No completion history to export yet');
        return;
      }
      const csv = buildHabitsCsv(habits, completions);
      downloadCsv(csv, `habit-tracker-export-${toDateKey(new Date())}.csv`);
      toast.success('CSV downloaded');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not export your data'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Personalize how Habit Tracker looks and behaves
        </p>
      </div>

      <SectionCard title="Appearance" description="Choose how the interface looks">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors duration-150 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
              {theme === 'dark' ? (
                <Moon size={17} className="text-indigo-400" />
              ) : (
                <Sun size={17} className="text-amber-500" />
              )}
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between light and dark themes
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            onClick={toggleTheme}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 shadow transition-transform duration-200 ease-out ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            >
              {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
            </span>
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Preferences" description="Tune the app to how you like to work">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Start day of week
            </label>
            <select
              value={startDay}
              onChange={(e) => handleStartDayChange(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Reminders"
        description="Get a browser notification when a scheduled habit isn't marked done yet"
      >
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors duration-150 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
              {remindersEnabled ? (
                <Bell size={17} className="text-indigo-500" />
              ) : (
                <BellOff size={17} className="text-slate-400" />
              )}
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {remindersEnabled ? 'Reminders on' : 'Reminders off'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set a reminder time on each habit (in Add/Edit Habit) to use this. Only fires
                while this app is open in your browser.
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={remindersEnabled}
            onChange={handleToggleReminders}
            onIcon={<Bell size={12} />}
            offIcon={<BellOff size={12} />}
          />
        </div>
        {remindersEnabled && (
          <button
            type="button"
            onClick={handleTestNotification}
            className="mt-3 text-sm font-medium text-indigo-600 transition-colors duration-150 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Send a test notification →
          </button>
        )}
      </SectionCard>

      <SectionCard title="Data" description="Export your habit history">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors duration-150 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
              <Download size={17} className="text-slate-500 dark:text-slate-300" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Export as CSV
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download your full completion history, one row per day per habit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download size={14} />
            {exporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Account" description="Security and session">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/profile"
            className="group inline-flex items-center justify-between gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:justify-center"
          >
            <span className="flex items-center gap-2">
              <KeyRound size={16} /> Change Password
            </span>
            <ChevronRight size={14} className="text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 sm:hidden" />
          </Link>
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 hover:shadow-md"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
        title="Log out?"
        message="You'll need to sign in again to access your habits."
        confirmLabel="Log out"
        danger
      />
    </div>
  );
}