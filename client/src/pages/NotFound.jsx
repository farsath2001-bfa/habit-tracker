import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full text-[var(--accent-500)]"
        style={{
          backgroundImage:
            'linear-gradient(135deg, color-mix(in srgb, var(--accent-500) 14%, transparent), color-mix(in srgb, var(--accent-500) 4%, transparent))',
        }}
      >
        <Compass size={40} />
      </div>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">404 - Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <Home size={16} /> Back to Dashboard
      </Link>
    </div>
  );
}