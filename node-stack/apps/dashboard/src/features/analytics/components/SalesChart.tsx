/**
 * TrendChart — main area chart widget.
 * Shows two time series: "Visitas" and "Sesiones".
 * File kept as SalesChart.tsx for import compatibility.
 */
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

export interface TrendPoint {
  label: string;
  visitas: number;
  sesiones: number;
}

type Period = "7D" | "30D" | "3M" | "1A";

const PERIODS: Period[] = ["7D", "30D", "3M", "1A"];

interface TrendChartProps {
  data: TrendPoint[];
  title?: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const ChartTooltip: FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-elevated border border-border rounded-[12px] px-3.5 py-3 shadow-lg text-[12px] min-w-[140px]">
      <p className="text-[11px] font-bold text-gray-400 mb-2.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-fg-muted capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-fg tabular-nums">
            {p.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const SalesChart: FC<TrendChartProps> = ({
  data,
  title = "Tendencia de actividad",
  period,
  onPeriodChange,
}) => {
  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-semibold text-fg">{title}</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Visitas y sesiones en el período</p>
        </div>

        {/* Legend + period tabs */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#004080]" />
              <span>Visitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#4D94DB]" />
              <span>Sesiones</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 bg-surface-hover rounded-[10px] p-0.5">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={cn(
                  "px-2.5 py-1 rounded-[8px] text-[11px] font-medium transition-all duration-200",
                  period === p
                    ? "bg-white dark:bg-white/15 text-fg shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-visitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#004080" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#004080" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="trend-sesiones" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4D94DB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4D94DB" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} strokeOpacity={0.8} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} dy={6} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#004080", strokeWidth: 1, strokeOpacity: 0.2 }}
              wrapperStyle={{ outline: "none", zIndex: 50 }}
            />
            <Area type="monotone" dataKey="visitas" name="Visitas" stroke="#004080" strokeWidth={2} fill="url(#trend-visitas)" dot={false} isAnimationActive={false} activeDot={{ r: 4, fill: "#004080", strokeWidth: 2, stroke: "white" }} />
            <Area type="monotone" dataKey="sesiones" name="Sesiones" stroke="#4D94DB" strokeWidth={2} fill="url(#trend-sesiones)" dot={false} isAnimationActive={false} activeDot={{ r: 4, fill: "#4D94DB", strokeWidth: 2, stroke: "white" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
