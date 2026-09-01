/**
 * A Recharts custom tooltip content renderer, styled with real Tailwind
 * dark: classes so it themes correctly (Recharts' own `contentStyle` is a
 * static inline style and can't react to the dark class).
 */
export default function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      {label !== undefined && (
        <p className="mb-1 font-medium text-slate-500 dark:text-slate-400">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((entry, i) => {
        const [value, name] = formatter
          ? formatter(entry.value, entry.name, entry)
          : [entry.value, entry.name];
        return (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-slate-500 dark:text-slate-400">{name}:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
