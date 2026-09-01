import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import useTheme from '../../hooks/useTheme';
import { resolveSeriesColor } from '../../utils/colors';
import ChartTooltip from './ChartTooltip';

export default function HabitPerformanceChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = (data || []).map((h) => ({
    name: `${h.icon} ${h.name}`,
    percent: h.completionPercent,
    color: resolveSeriesColor(h.color, isDark),
  }));

  const height = Math.max(220, chartData.length * 44);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 28, left: 8, bottom: 5 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-400"
            axisLine={{ stroke: 'var(--chart-axis)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-slate-500"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip formatter={(value) => [`${value}%`, 'Completion']} />}
            cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }}
          />
          <Bar dataKey="percent" radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive animationDuration={500}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
