import { Check } from 'lucide-react';
import { lastNDateKeys } from '../../utils/dateUtils';
import { getContrastText } from '../../utils/colors';

/** Renders a 7-day mini strip: a filled check for completed, a hollow ring for not, for the last 7 days. */
export default function WeekStrip({ completionKeys, color = '#6366f1' }) {
  const days = lastNDateKeys(7);
  const completedSet = new Set(completionKeys);
  const todayKey = days[days.length - 1];

  return (
    <div className="flex items-center gap-1.5">
      {days.map((key) => {
        const done = completedSet.has(key);
        const dayLabel = new Date(key).getUTCDate();
        const isToday = key === todayKey;
        return (
          <div
            key={key}
            title={key}
            className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold transition-all duration-150 ${
              done
                ? 'shadow-sm'
                : 'border border-dashed border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-500'
            } ${isToday && !done ? 'border-solid border-slate-400 dark:border-slate-500' : ''}`}
            style={done ? { backgroundColor: color, color: getContrastText(color) } : undefined}
          >
            {done ? <Check size={13} strokeWidth={3} /> : dayLabel}
          </div>
        );
      })}
    </div>
  );
}
