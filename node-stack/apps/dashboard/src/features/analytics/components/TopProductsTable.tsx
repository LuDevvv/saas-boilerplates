/**
 * TopSourcesWidget — ranked channel/source list with change indicators.
 * File kept as TopProductsTable.tsx for import compatibility.
 */
import { FC } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/classNames";

export interface SourceItem {
  name: string;
  visits: number;
  change: number;
  color: string;
  percentage: number;
}

interface TopProductsTableProps {
  title?: string;
  sources: SourceItem[];
}

export const TopProductsTable: FC<TopProductsTableProps> = ({
  title = "Principales canales",
  sources,
}) => {
  const maxVisits = Math.max(...sources.map(s => s.visits), 1);

  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface p-5 flex flex-col gap-4 h-full">
      <h3 className="text-[14px] font-semibold text-fg">{title}</h3>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-0 text-[11px] font-bold uppercase text-gray-400">
        <span className="flex-1">Canal</span>
        <span className="w-20 text-right">Visitas</span>
        <span className="w-14 text-right">Cambio</span>
      </div>

      {/* Source rows */}
      <div className="space-y-3">
        {sources.map((source, i) => {
          const isPositive = source.change >= 0;
          return (
            <div key={source.name} className="space-y-1.5">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Rank + name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 tabular-nums w-4 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="h-5 w-5 rounded-[6px] flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                    style={{ background: source.color }}
                  >
                    {source.name.charAt(0)}
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-medium text-fg-secondary truncate">
                    {source.name}
                  </span>
                </div>

                {/* Visits */}
                <span className="text-[12px] sm:text-[13px] font-semibold text-fg tabular-nums shrink-0">
                  {source.visits.toLocaleString()}
                </span>

                {/* Change */}
                <div className={cn(
                  "inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold shrink-0 w-12 justify-end",
                  isPositive ? "text-emerald-500" : "text-red-500"
                )}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(source.change)}%
                </div>
              </div>

              {/* Progress bar — no margin-left to prevent overflow */}
              <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(source.visits / maxVisits) * 100}%`,
                    background: source.color,
                    opacity: 0.75,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
