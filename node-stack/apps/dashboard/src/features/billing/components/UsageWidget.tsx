import { Activity, TrendingUp } from "lucide-react";
import { FC } from "react";

import { cn } from "@/utils/classNames";

interface UsageMetric {
  label: string;
  used: number;
  limit: number | null; // null = unlimited
  unit: string;
}

interface UsageWidgetProps {
  metrics?: UsageMetric[];
  isLoading?: boolean;
  planName?: string;
}

const PLAN_LIMITS: Record<string, UsageMetric[]> = {
  pro: [
    { label: "API calls", used: 0, limit: 10000, unit: "llamadas" },
    { label: "Almacenamiento", used: 0, limit: 10240, unit: "MB" },
  ],
  elite: [
    { label: "API calls", used: 0, limit: null, unit: "llamadas" },
    { label: "Almacenamiento", used: 0, limit: null, unit: "MB" },
  ],
};

const UsageBar: FC<{ metric: UsageMetric }> = ({ metric }) => {
  const pct = metric.limit ? Math.min(100, (metric.used / metric.limit) * 100) : 0;
  const isUnlimited = metric.limit === null;
  const isWarning = pct >= 80;
  const isCritical = pct >= 95;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium text-fg">{metric.label}</span>
        <span className={cn(
          "text-fg-muted",
          isWarning && "text-amber-600 dark:text-amber-400 font-medium",
          isCritical && "text-red-600 dark:text-red-400 font-medium"
        )}>
          {isUnlimited
            ? `${metric.used.toLocaleString()} ${metric.unit}`
            : `${metric.used.toLocaleString()} / ${metric.limit?.toLocaleString()} ${metric.unit}`}
        </span>
      </div>

      {!isUnlimited && (
        <div className="relative h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-700",
              isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {isUnlimited && (
        <div className="h-1.5 w-full rounded-full bg-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary to-primary/30 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export const UsageWidget: FC<UsageWidgetProps> = ({ metrics, isLoading, planName }) => {
  const displayMetrics = metrics ?? PLAN_LIMITS[planName?.toLowerCase() ?? ""] ?? [];

  if (isLoading) {
    return (
      <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 space-y-4">
        <div className="h-4 w-24 rounded-full bg-surface-hover animate-pulse" />
        {[1, 2].map(i => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded-full bg-surface-hover animate-pulse" />
              <div className="h-3 w-16 rounded-full bg-surface-hover animate-pulse" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-hover animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (displayMetrics.length === 0) return null;

  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-[14px] font-semibold text-fg">Uso del plan</h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-fg-muted">
          <TrendingUp className="h-3 w-3" />
          Este mes
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {displayMetrics.map(m => (
          <UsageBar key={m.label} metric={m} />
        ))}

        <p className="text-[11px] text-fg-muted pt-1">
          El uso se restablece al inicio de cada ciclo de facturación.
        </p>
      </div>
    </div>
  );
};
