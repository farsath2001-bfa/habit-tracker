import { Link } from 'react-router-dom';
import { LogIn, Lock } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full text-rose-500"
        style={{
          backgroundImage:
            'linear-gradient(135deg, color-mix(in srgb, currentColor 14%, transparent), color-mix(in srgb, currentColor 4%, transparent))',
        }}
      >
        <Lock size={40} />
      </div>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Access Restricted</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        You need to be signed in to view this page. Please log in to continue.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <LogIn size={16} /> Go to Login
      </Link>
    </div>
  );
}