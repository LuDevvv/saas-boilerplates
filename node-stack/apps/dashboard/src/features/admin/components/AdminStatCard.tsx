import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { FC } from "react";

import { cn } from "@/utils/classNames";

interface AdminStatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: string;
}

export const AdminStatCard: FC<AdminStatCardProps> = ({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-card)] hover:border-border-strong hover:-translate-y-0.5 active:scale-[0.99]">
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("rounded-xl p-3 transition-transform group-hover:rotate-6", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-[10px] font-label px-2 py-0.5 rounded-full uppercase border",
            trend === "up"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : trend === "down"
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              : "bg-surface-hover text-fg-muted border-border"
          )}
        >
          {change}
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : trend === "down" ? (
            <ArrowDownRight className="h-3 w-3" />
          ) : null}
        </div>
      </div>
      <div className="mt-5 relative z-10">
        <p className="text-[11px] font-label uppercase tracking-wider text-fg-muted mb-1">{label}</p>
        <h3 className="text-[30px] font-kpi text-fg leading-none">{value}</h3>
      </div>

      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
