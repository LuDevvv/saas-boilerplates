import { FC } from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/utils/classNames";

// ─── Inline sparkline ─────────────────────────────────────────────────────────

const Sparkline: FC<{ data: number[]; color: string; id: string }> = ({ data, color, id }) => (
  <ResponsiveContainer width="100%" height={36}>
    <AreaChart
      data={data.map((v, i) => ({ i, v }))}
      margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor={color} stopOpacity={0.22} />
          <stop offset="95%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="v"
        stroke={color}
        strokeWidth={1.5}
        fill={`url(#${id})`}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Component ────────────────────────────────────────────────────────────────

export interface KpiCardProps {
  label: string;
  value: string;
  change: number;
  period?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  sparkline: number[];
  color?: string;
  /** When true, a negative change is good (e.g. bounce rate) */
  invertTrend?: boolean;
}

export const KpiCard: FC<KpiCardProps> = ({
  label,
  value,
  change,
  period = "vs mes anterior",
  icon: Icon,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  sparkline,
  color = "#004080",
  invertTrend = false,
}) => {
  const isPositive = invertTrend ? change <= 0 : change >= 0;
  const gradId = `kpi-${label.replace(/\s+/g, "")}`;

  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] sm:text-[12px] font-medium text-fg-muted leading-snug">{label}</p>
        <div className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-[8px] sm:rounded-[10px] flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", iconColor)} />
        </div>
      </div>

      <p className="text-[20px] sm:text-[26px] font-semibold text-fg tabular-nums leading-none">
        {value}
      </p>

      <div className="flex items-center gap-1 flex-wrap">
        <span className={cn(
          "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold shrink-0",
          isPositive
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
            : "text-red-500 bg-red-50 dark:bg-red-500/10"
        )}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive && change > 0 ? "+" : ""}{change}%
        </span>
        <span className="text-[10px] sm:text-[11px] text-fg-muted hidden xs:inline">{period}</span>
      </div>

      <Sparkline data={sparkline} color={color} id={gradId} />
    </div>
  );
};
