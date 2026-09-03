import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Sparkles, TrendingUp, Target, Mail, Lock, User, ShieldCheck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import Logo from '../components/common/Logo';
import habitImage from '../assets/habit-image.png';

const features = [
  { icon: Target, text: 'Set daily, weekday, weekend or custom goals' },
  { icon: TrendingUp, text: 'Watch your completion rate climb' },
  { icon: Sparkles, text: 'Free forever, no credit card required' },
];

function BrandPanel() {
  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white lg:flex lg:w-[42%] xl:p-8">
      {/* Faint dot-grid texture for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* Slow-drifting glow blobs - the "animation" that gives the panel life */}
      <div className="blob-drift pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="blob-drift-slow pointer-events-none absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-fuchsia-400/25 blur-3xl" />
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

      <div className="float-y relative mx-auto">
        <div className="pointer-events-none absolute inset-2 -z-10 rounded-full bg-white/25 blur-2xl" />
        <img
          src={habitImage}
          alt=""
          className="relative mx-auto w-40 rounded-2xl shadow-2xl ring-1 ring-white/20 xl:w-48"
        />
      </div>

      <div className="relative">
        <h2 className="text-2xl font-bold leading-tight xl:text-3xl">
          Start your streak
          <br />
          today.
        </h2>
        <p className="mt-3 max-w-xs text-sm text-indigo-100">
          Join and start building the routines that get you to your goals.
        </p>
        <ul className="mt-6 space-y-2.5">
          {features.map(({ icon: Icon, text }, i) => (
            <li
              key={text}
              className="fade-in-up flex items-center gap-3 text-sm text-indigo-50"
              style={{ animationDelay: `${200 + i * 130}ms` }}
            >
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

export default function Register() {
  const { register, getErrorMessage } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password });
      toast.success(`Welcome, ${user.name.split(' ')[0]}! Your account is ready.`);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, 'Could not create your account');
      setApiError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <BrandPanel />

      <div className="relative flex w-full flex-1 items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-6">
        <div className="dot-grid-subtle pointer-events-none absolute inset-0 opacity-60" />
        <div className="blob-drift pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-500/10" />
        <div className="blob-drift-slow pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl dark:bg-violet-500/10" />

        <div className="fade-in relative w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/60 dark:shadow-none sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo size={48} className="mb-3 shadow-md lg:hidden" />
            <span className="mb-4 hidden h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30 lg:flex">
              <UserPlus size={20} />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Start building better habits today
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
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Full name
              </label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/20 ${
                    errors.name ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="Jane Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/20 ${
                    errors.email ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/20 ${
                    errors.password ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="At least 6 characters"
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

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Confirm password
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/20 ${
                    errors.confirmPassword ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="Re-enter your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
            >
              {submitting ? (
                <>
                  <Spinner size="xs" tone="white" /> Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Create account
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 lg:text-left">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign in
            </Link>
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            {[
              { icon: Sparkles, text: 'Free forever' },
              { icon: CreditCard, text: 'No credit card' },
              { icon: ShieldCheck, text: 'Secure' },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"
              >
                <Icon size={11} /> {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}