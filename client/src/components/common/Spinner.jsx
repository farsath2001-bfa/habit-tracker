const sizeMap = {
  xs: 'h-3.5 w-3.5 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export default function Spinner({ size = 'md', className = '', tone = 'accent' }) {
  const toneClass =
    tone === 'white'
      ? 'border-white/30 border-t-white'
      : 'border-slate-200 border-t-indigo-500 dark:border-slate-700 dark:border-t-indigo-400';
  return (
    <div
      className={`spinner shrink-0 rounded-full ${toneClass} ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
