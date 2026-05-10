import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from "lucide-react";
import { FC, ReactNode } from "react";

import { cn } from "../../utils.js";

export interface StatRowTrend {
  /** Numeric trend (e.g. 12 → "+12%"). Sign is auto-prefixed. */
  value: number;
  /** Direction overrides automatic sign-based detection if provided. */
  direction?: "up" | "down" | "flat";
  /** Suffix to append after the number — defaults to "%". */
  suffix?: string;
  /** Optional descriptor (e.g. "vs ayer"). */
  label?: string;
}

export interface StatRowProps {
  icon: LucideIcon;
  label: string;
  /** Main value — string or number. Numbers are auto-formatted with thousands separators. */
  value: string | number | ReactNode;
  /** Optional trend indicator. */
  trend?: StatRowTrend;
  /** Compact variant for dense sidebars. */
  compact?: boolean;
  className?: string;
}

const TREND_TONE_CLASSES = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-red-500 dark:text-red-400",
  flat: "text-fg-muted",
} as const;

/**
 * Compact "label + value" row with an icon and an optional trend chip.
 *
 * Used inside Aside columns of detail screens (Members, Billing, Profile).
 *
 * @example
 * <StatRow icon={Users} label="Total miembros" value={42} trend={{ value: 12 }} />
 * <StatRow icon={DollarSign} label="MRR" value="$1,240" trend={{ value: -3.2, label: "vs mes pasado" }} />
 */
export const StatRow: FC<StatRowProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  compact = false,
  className,
}) => {
  const direction =
    trend?.direction ??
    (trend === undefined ? "flat" : trend.value > 0 ? "up" : trend.value < 0 ? "down" : "flat");
  const trendTone = TREND_TONE_CLASSES[direction];
  const TrendArrow = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString()
      : value;

  const sign = trend && trend.value > 0 ? "+" : "";

  return (
    <div
      className={cn(
        "flex items-center gap-3 group",
        compact ? "py-1.5" : "py-2",
        className
      )}
    >
      <div className="h-8 w-8 rounded-[10px] bg-surface-muted border border-border-subtle flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-fg-muted" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase  text-fg-muted truncate">
          {label}
        </p>
        <p className="text-[14px] font-semibold text-fg leading-snug truncate tabular-nums">
          {formattedValue}
        </p>
      </div>

      {trend && (
        <div
          className={cn(
            "shrink-0 inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums",
            trendTone
          )}
        >
          <TrendArrow className="h-3 w-3" />
          {sign}
          {trend.value}
          {trend.suffix ?? "%"}
        </div>
      )}

      {trend?.label && (
        <span className="shrink-0 text-[10px] text-fg-muted">{trend.label}</span>
      )}
    </div>
  );
};

StatRow.displayName = "StatRow";
