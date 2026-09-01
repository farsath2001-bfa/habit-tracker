import ProgressBar from '../common/ProgressBar';
import useCountUp from '../../hooks/useCountUp';

export default function StatCard({ label, value, suffix = '', icon, accent = '#6366f1', progress }) {
  const animated = useCountUp(value);

  return (
    <div
      className="fade-in group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      style={{ backgroundImage: `linear-gradient(180deg, ${accent}0d, transparent 60%)` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {animated}
        {suffix}
      </p>
      {typeof progress === 'number' && (
        <div className="mt-3">
          <ProgressBar percent={progress} color={accent} />
        </div>
      )}
    </div>
  );
}
