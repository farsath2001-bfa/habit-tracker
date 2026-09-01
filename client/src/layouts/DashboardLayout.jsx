import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Calendar,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Logo from '../components/common/Logo';
import useLocalStorage from '../hooks/useLocalStorage';
import useHabitReminders from '../hooks/useHabitReminders';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/habits', label: 'My Habits', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
              isActive
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
              )}
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [remindersEnabled] = useLocalStorage('habit_tracker_reminders_enabled', false);
  // Runs app-wide (any authenticated page) so a reminder can fire no matter
  // where the user currently is - see useHabitReminders.js for the caveat
  // that this only works while the app is open in a browser tab.
  useHabitReminders(remindersEnabled);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-8 flex items-center gap-2.5 px-5">
          <Logo size={36} />
          <span className="text-lg font-bold text-slate-900 dark:text-white">HabitTracker</span>
        </div>
        <NavList />
        <div className="mt-auto border-t border-slate-100 px-4 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={user?.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90 md:hidden">
        <div className="flex items-center gap-2">
          <Logo size={30} rounded="rounded-lg" />
          <span className="font-bold text-slate-900 dark:text-white">HabitTracker</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile slide-out drawer - always mounted so both open and close animate smoothly */}
      <div className="md:hidden">
        <div
          className={`drawer-backdrop fixed inset-0 z-40 bg-slate-900/50 ${mobileOpen ? 'drawer-open' : ''}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`drawer-panel fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white py-6 shadow-xl dark:bg-slate-900 ${
            mobileOpen ? 'drawer-open' : ''
          }`}
        >
          <div className="mb-6 flex items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <Logo size={36} />
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                HabitTracker
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <NavList onNavigate={() => setMobileOpen(false)} />
          <div className="mt-auto border-t border-slate-100 px-4 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <Avatar name={user?.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setConfirmLogout(true);
              }}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 pt-16 md:pb-8 md:pt-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 py-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        {navItems.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Icon size={20} />
            {label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>

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