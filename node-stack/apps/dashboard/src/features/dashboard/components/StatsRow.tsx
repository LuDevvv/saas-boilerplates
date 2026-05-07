import { FC } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/classNames";

export interface StatMetric {
  id: string;
  label: string;
  value: string;
  change?: number;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

interface StatsRowProps {
  metrics: StatMetric[];
  className?: string;
}

export const StatsRow: FC<StatsRowProps> = ({ metrics, className }) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {metrics.map((m) => {
        const isPositive = (m.change ?? 0) >= 0;
        const Icon = m.icon;

        return (
          <div
            key={m.id}
            className="bg-white dark:bg-surface border border-border rounded-[20px] p-5 flex flex-col gap-3"
          >
            {/* Label + icon */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-fg-muted uppercase ">
                {m.label}
              </p>
              {Icon && (
                <div className={cn(
                  "h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0",
                  m.iconBg ?? "bg-surface-muted"
                )}>
                  <Icon className={cn("h-4 w-4", m.iconColor ?? "text-gray-400")} />
                </div>
              )}
            </div>

            {/* Value */}
            <p className="text-[26px] sm:text-[28px] font-black text-fg tabular-nums leading-none">
              {m.value}
            </p>

            {/* Change indicator */}
            {m.change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-[12px] font-semibold",
                isPositive ? "text-emerald-500" : "text-red-500"
              )}>
                {isPositive
                  ? <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                  : <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                }
                <span>{Math.abs(m.change)}% vs. mes anterior</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
