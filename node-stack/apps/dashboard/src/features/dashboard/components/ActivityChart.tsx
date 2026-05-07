import { FC } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { cn } from "@/utils/classNames";

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface ActivityChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  /** CSS color value. Defaults to var(--primary). */
  color?: string;
  /** Unique id for the SVG gradient — use when rendering multiple charts. */
  gradientId?: string;
  className?: string;
}

const CustomTooltip: FC<TooltipProps<number, string> & { color?: string }> = ({
  active,
  payload,
  label,
  color,
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-elevated border border-border rounded-[12px] px-3 py-2 shadow-lg">
      <p className="text-[13px] font-bold text-fg tabular-nums">
        {payload[0].value}
      </p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
      {color && (
        <div className="h-1 w-6 rounded-full mt-2" style={{ background: color }} />
      )}
    </div>
  );
};

export const ActivityChart: FC<ActivityChartProps> = ({
  title,
  subtitle,
  data,
  color = "var(--primary)",
  gradientId = "activity-grad",
  className,
}) => {
  return (
    <div className={cn(
      "bg-white dark:bg-surface border border-border rounded-[20px] p-5",
      className
    )}>
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-[14px] font-semibold text-fg">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12px] text-fg-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
            strokeOpacity={0.8}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={<CustomTooltip color={color} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.25 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: "white" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
