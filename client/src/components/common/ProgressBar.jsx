export default function ProgressBar({ percent = 0, color = '#6366f1', className = '', trackClassName = '' }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${trackClassName}`}
    >
      <div
        className={`progress-fill h-full rounded-full ${className}`}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
