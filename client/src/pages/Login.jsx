import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Flame, BarChart3, CalendarCheck2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import Logo from '../components/common/Logo';
import habitImage from '../assets/habit-image.png';

const features = [
  { icon: Flame, text: 'Build and track streaks that stick' },
  { icon: CalendarCheck2, text: 'A GitHub-style calendar of your progress' },
  { icon: BarChart3, text: 'Rich analytics on every habit' },
];

function BrandPanel() {
  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-10 text-white lg:flex lg:w-[42%]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)',
        }}
      />
      <div className="relative flex items-center gap-2">
        <Logo size={36} />
        <span className="text-lg font-bold">HabitTracker</span>
      </div>

      <img
        src={habitImage}
        alt=""
        className="relative mx-auto w-48 drop-shadow-xl xl:w-56"
      />

      <div className="relative">
        <h2 className="text-3xl font-bold leading-tight">
          Small habits.
          <br />
          Remarkable results.
        </h2>
        <p className="mt-3 max-w-xs text-sm text-indigo-100">
          Track your daily habits, build streaks, and watch your progress compound over time.
        </p>
        <ul className="mt-8 space-y-3">
          {features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-indigo-50">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                <Icon size={16} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-indigo-200">© {new Date().getFullYear()} HabitTracker</p>
    </div>
  );
}

export default function Login() {
  const { login, getErrorMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid email or password');
      setApiError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <BrandPanel />

      <div className="flex w-full flex-1 items-center justify-center px-4 py-10">
        <div className="fade-in w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo size={48} className="mb-3 shadow-md lg:hidden" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sign in to keep your streak going
            </p>
          </div>

          <div
            className={`grid overflow-hidden transition-all duration-300 ease-out ${
              apiError ? 'mb-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="min-h-0">
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                {apiError}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/20 ${
                  errors.email ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/20 ${
                    errors.password ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-150 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-sm"
            >
              {submitting ? (
                <>
                  <Spinner size="xs" tone="white" /> Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} /> Sign in
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 lg:text-left">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Create one
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-slate-400 lg:text-left">
            Demo login: demo@example.com / Demo1234
          </p>
        </div>
      </div>
    </div>
  );
}