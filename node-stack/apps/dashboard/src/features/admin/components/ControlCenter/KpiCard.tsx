import { FC } from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/utils/classNames";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: string;
  loading?: boolean;
}

export const KpiCard: FC<KpiCardProps> = ({
  label, value, sub, icon: Icon, trend, trendLabel, color = "text-primary bg-primary/10", loading,
}) => (
  <div className="group relative overflow-hidden rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card)] hover:border-border-strong hover:-translate-y-0.5 transition-all">
    <div className="flex items-start justify-between">
      <div className={cn("h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", color)}>
        <Icon className="h-5 w-5" />
      </div>
      {trend && trendLabel && (
        <span className={cn(
          "flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase",
          trend === "up" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : trend === "down" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
            : "bg-surface-hover text-fg-muted border-border"
        )}>
          {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {trendLabel}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{label}</p>
      {loading ? (
        <div className="mt-1 h-8 w-20 rounded-lg bg-surface-muted animate-pulse" />
      ) : (
        <p className="mt-1 text-[28px] font-heading text-fg leading-none">{value}</p>
      )}
      {sub && <p className="text-[11px] text-fg-muted mt-1">{sub}</p>}
    </div>
    <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);
