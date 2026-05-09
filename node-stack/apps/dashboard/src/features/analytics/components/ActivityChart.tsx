/**
 * BarWidget — activity bar chart widget.
 * Shows current period vs previous period side-by-side bars.
 * File kept as ActivityChart.tsx for import compatibility.
 */
import { TrendingUp, TrendingDown } from "lucide-react";
import { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

import { cn } from "@/utils/classNames";

export interface BarPoint {
  label: string;
  actual: number;
  anterior: number;
}

interface ActivityChartProps {
  title: string;
  value: string;
  change: number;
  data: BarPoint[];
}

const ChartTooltip: FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-elevated border border-border rounded-[12px] px-3.5 py-3 shadow-lg text-[12px] min-w-[130px]">
      <p className="text-[11px] font-bold text-gray-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: p.fill as string }} />
            <span className="text-gray-400 text-[11px] capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-fg tabular-nums">
            {p.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export const ActivityChart: FC<ActivityChartProps> = ({
  title,
  value,
  change,
  data,
}) => {
  const isPositive = change >= 0;

  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-[24px] font-semibold text-fg tabular-nums leading-none">
              {value}
            </p>
            <span className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-semibold",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive && change > 0 ? "+" : ""}{change}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#004080]" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-gray-200 dark:bg-white/20" />
            <span>Anterior</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} strokeOpacity={0.8} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} dy={6} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--border)", fillOpacity: 0.35, radius: 4 }}
              wrapperStyle={{ outline: "none", zIndex: 50 }}
            />
            <Bar dataKey="anterior" name="Anterior" fill="#E5E7EB" radius={[4, 4, 0, 0]} maxBarSize={12}
                 isAnimationActive={false} />
            <Bar dataKey="actual" name="Actual" fill="#004080" radius={[4, 4, 0, 0]} maxBarSize={12}
                 isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
