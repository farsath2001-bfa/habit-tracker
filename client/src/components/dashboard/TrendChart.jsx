import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatShortDate } from '../../utils/dateUtils';
import { ACCENT } from '../../utils/colors';
import ChartTooltip from '../analytics/ChartTooltip';

export default function TrendChart({ data }) {
  const chartData = (data || []).map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ACCENT.light} stopOpacity={0.22} />
              <stop offset="95%" stopColor={ACCENT.light} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-400"
            axisLine={{ stroke: 'var(--chart-axis)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-400"
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            content={<ChartTooltip formatter={(value) => [`${value}%`, 'Completion']} />}
            cursor={{ stroke: 'var(--chart-axis)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="percent"
            stroke={ACCENT.light}
            strokeWidth={2}
            fill="url(#trendFill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
            isAnimationActive
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
