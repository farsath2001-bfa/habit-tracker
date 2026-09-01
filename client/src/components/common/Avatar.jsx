const COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-sky-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-rose-500',
];

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorForName = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

export default function Avatar({ name = '', size = 'md', className = '', ring = false }) {
  const circle = (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${getColorForName(
        name
      )} ${sizeMap[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );

  if (!ring) return circle;

  return (
    <div className="rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-400 p-[3px] shadow-md">
      <div className="rounded-full bg-white p-[3px] dark:bg-slate-900">{circle}</div>
    </div>
  );
}
