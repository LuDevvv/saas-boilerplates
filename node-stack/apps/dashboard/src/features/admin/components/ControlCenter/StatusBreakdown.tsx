import { FC } from "react";
import { cn } from "@/utils/classNames";

interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface StatusBreakdownProps {
  items: BreakdownItem[];
  total?: number;
  loading?: boolean;
}

export const StatusBreakdown: FC<StatusBreakdownProps> = ({ items, total, loading }) => {
  const sum = total ?? items.reduce((s, i) => s + i.value, 0);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-surface-muted animate-pulse" />
            <div className="flex-1 h-2 rounded-full bg-surface-muted animate-pulse" />
            <div className="h-3 w-8 rounded bg-surface-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(({ label, value, color }) => {
        const pct = sum > 0 ? Math.round((value / sum) * 100) : 0;
        return (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full shrink-0", color)} />
                <span className="text-[12px] text-fg-secondary capitalize">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-fg-muted">{pct}%</span>
                <span className="text-[12px] font-semibold text-fg tabular-nums w-12 text-right">{value.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
