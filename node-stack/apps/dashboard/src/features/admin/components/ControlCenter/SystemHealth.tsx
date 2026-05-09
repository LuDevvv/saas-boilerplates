import type { AdminStats } from "@node-stack/types";
import { Server, Cpu, Clock, CheckCircle2 } from "lucide-react";
import { FC } from "react";

import { cn } from "@/utils/classNames";

interface SystemHealthProps {
  system?: AdminStats["system"];
  loading?: boolean;
}

const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const SystemHealth: FC<SystemHealthProps> = ({ system, loading }) => {
  const memPct = system ? Math.round((system.memoryUsedMb / system.memoryTotalMb) * 100) : 0;

  const rows = [
    {
      icon: CheckCircle2,
      label: "Estado",
      value: system?.status ?? "—",
      color: system?.status === "healthy" ? "text-emerald-500" : "text-red-500",
      valueClass: system?.status === "healthy" ? "text-emerald-600 dark:text-emerald-400 capitalize" : "text-red-500 capitalize",
    },
    {
      icon: Clock,
      label: "Uptime",
      value: system ? formatUptime(system.uptimeSeconds) : "—",
      color: "text-primary",
      valueClass: "text-fg-secondary",
    },
    {
      icon: Cpu,
      label: "Memoria heap",
      value: system ? `${system.memoryUsedMb} / ${system.memoryTotalMb} MB` : "—",
      color: memPct > 80 ? "text-red-500" : "text-amber-500",
      valueClass: "text-fg-secondary",
      bar: system ? memPct : undefined,
      barColor: memPct > 80 ? "bg-red-500" : memPct > 60 ? "bg-amber-500" : "bg-emerald-500",
    },
    {
      icon: Server,
      label: "Node.js",
      value: system?.nodeVersion ?? "—",
      color: "text-fg-muted",
      valueClass: "text-fg-secondary font-mono text-[11px]",
    },
  ];

  return (
    <div className="space-y-4">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[10px] bg-surface-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-20 rounded bg-surface-muted animate-pulse" />
              <div className="h-2 w-28 rounded bg-surface-muted animate-pulse" />
            </div>
          </div>
        ))
      ) : (
        rows.map(({ icon: Icon, label, value, color, valueClass, bar, barColor }) => (
          <div key={label}>
            <div className="flex items-center gap-3">
              <div className={cn("h-8 w-8 rounded-[10px] bg-surface-muted border border-border-subtle flex items-center justify-center shrink-0", color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="text-[12px] text-fg-secondary">{label}</span>
                <span className={cn("text-[12px] font-semibold", valueClass)}>{value}</span>
              </div>
            </div>
            {bar !== undefined && (
              <div className="mt-1.5 ml-11 h-1 w-full rounded-full bg-surface-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${bar}%` }} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
