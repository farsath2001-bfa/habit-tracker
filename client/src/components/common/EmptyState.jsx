export default function EmptyState({ icon = '🌱', title, description, action }) {
  return (
    <div className="fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
        style={{
          backgroundImage:
            'linear-gradient(135deg, color-mix(in srgb, var(--accent-500) 14%, transparent), color-mix(in srgb, var(--accent-500) 4%, transparent))',
        }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
