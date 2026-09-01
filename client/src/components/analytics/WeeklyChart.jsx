import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ACCENT } from '../../utils/colors';
import ChartTooltip from './ChartTooltip';

export default function WeeklyChart({ data }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-slate-400"
            axisLine={{ stroke: 'var(--chart-axis)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-slate-400"
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            content={<ChartTooltip formatter={(value) => [`${value}%`, 'Completion']} />}
            cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }}
          />
          <Bar
            dataKey="percent"
            name="Completion %"
            fill={ACCENT.light}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
