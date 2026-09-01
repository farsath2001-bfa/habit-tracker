import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ACCENT } from '../../utils/colors';
import ChartTooltip from './ChartTooltip';

export default function MonthlyChart({ data }) {
  const chartData = (data || []).map((d) => ({
    ...d,
    day: new Date(d.date).getUTCDate(),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="day"
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
            content={<ChartTooltip formatter={(value) => [`${value}%`, 'Completion']} labelFormatter={(label) => `Day ${label}`} />}
            cursor={{ stroke: 'var(--chart-axis)', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="percent"
            name="Completion %"
            stroke={ACCENT.light}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
            isAnimationActive
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
