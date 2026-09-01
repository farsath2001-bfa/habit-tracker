import { buildMonthGrid, getWeekdayLabels, formatFriendlyDate, toDateKey } from '../../utils/dateUtils';
import useTheme from '../../hooks/useTheme';
import { SEQUENTIAL_RAMP, sequentialStepIndex, getContrastText } from '../../utils/colors';

export default function Heatmap({ year, month, dayData, onSelectDay, selectedDateKey, startDay = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ramp = isDark ? SEQUENTIAL_RAMP.dark : SEQUENTIAL_RAMP.light;
  const noneColor = isDark ? SEQUENTIAL_RAMP.none.dark : SEQUENTIAL_RAMP.none.light;

  const weeks = buildMonthGrid(year, month, startDay);
  const weekdayLabels = getWeekdayLabels(startDay);
  const dataByKey = new Map((dayData || []).map((d) => [d.date, d]));
  const todayKey = toDateKey(new Date());

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-slate-400 sm:gap-2">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weeks.flat().map((cell, idx) => {
          if (!cell) return <div key={`pad-${idx}`} />;
          const info = dataByKey.get(cell.dateKey);
          const percent = info?.percent ?? 0;
          const scheduled = info?.scheduled ?? 0;
          const completed = info?.completed ?? 0;
          const isFuture = cell.dateKey > todayKey;
          const isSelected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === todayKey;

          const fill = scheduled === 0 ? noneColor : ramp[sequentialStepIndex(percent)];
          const textColor = scheduled === 0 ? undefined : getContrastText(fill);

          const tooltipText =
            scheduled === 0
              ? `${formatFriendlyDate(cell.dateKey)} · No habits scheduled`
              : `${formatFriendlyDate(cell.dateKey)} · ${percent}% (${completed}/${scheduled})`;

          return (
            <div key={cell.dateKey} className="group/cell relative">
              <button
                type="button"
                disabled={isFuture}
                onClick={() => onSelectDay(cell.dateKey)}
                style={{
                  backgroundColor: scheduled === 0 ? undefined : fill,
                  color: textColor,
                }}
                className={`fade-in flex aspect-square w-full flex-col items-center justify-center rounded-md text-xs font-semibold transition-all duration-150 ease-out hover:z-10 hover:scale-110 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none ${
                  scheduled === 0 ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500' : ''
                } ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : ''} ${
                  isToday && !isSelected ? 'ring-1 ring-indigo-300 dark:ring-indigo-700' : ''
                }`}
              >
                {cell.day}
              </button>

              {/* Hover/focus tooltip - accessible via keyboard focus too */}
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[10rem] -translate-x-1/2 scale-95 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-[11px] font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover/cell:scale-100 group-hover/cell:opacity-100 dark:bg-slate-100 dark:text-slate-900"
              >
                {tooltipText}
                <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-slate-900 dark:bg-slate-100" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-end gap-1.5 text-xs text-slate-400">
        <span>Less</span>
        {ramp.map((hex) => (
          <span key={hex} className="h-3 w-3 rounded-sm" style={{ backgroundColor: hex }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
