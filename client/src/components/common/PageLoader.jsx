import loaderLogo from '../../assets/habit-logo-full.png';

/**
 * Branded full-screen loading state, shown in place of the plain spinner
 * wherever the app needs to block on something before it can render real
 * content - verifying a stored auth token on first load (ProtectedRoute)
 * and building the printable report (PrintReport). Kept in its own file so
 * every "the whole page is waiting" moment looks the same.
 */
export default function PageLoader({ label = 'Loading your habits…' }) {
  return (
    <div className="fade-in flex h-screen w-full flex-col items-center justify-center gap-5 bg-slate-50 dark:bg-slate-950">
      <div className="loader-pulse relative">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-indigo-400/25 blur-2xl dark:bg-indigo-500/20" />
        <img src={loaderLogo} alt="Habit Tracker" className="w-28 drop-shadow-sm sm:w-32" />
      </div>

      <div className="flex items-center gap-1.5" role="status" aria-label="Loading">
        <span className="loader-dot h-2 w-2 rounded-full bg-indigo-500" style={{ animationDelay: '0ms' }} />
        <span className="loader-dot h-2 w-2 rounded-full bg-indigo-500" style={{ animationDelay: '150ms' }} />
        <span className="loader-dot h-2 w-2 rounded-full bg-indigo-500" style={{ animationDelay: '300ms' }} />
      </div>

      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
    </div>
  );
}