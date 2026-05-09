import { Progress } from "@node-stack/ui";
import { HardDrive, FileText, Database } from "lucide-react";
import { FC } from "react";

import { cn } from "@/utils/classNames";
import { formatBytes } from "@/utils/formatters";

interface StorageStatsProps {
  usedBytes: number;
  totalBytes: number;
  fileCount: number;
  isLoading: boolean;
}

const TONE_THRESHOLDS = [
  { max: 60, bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  { max: 85, bar: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400" },
  { max: 100, bar: "bg-red-500",    text: "text-red-600 dark:text-red-400" },
];

export const StorageStats: FC<StorageStatsProps> = ({ usedBytes, totalBytes, fileCount, isLoading }) => {
  const percentUsed = totalBytes > 0 ? Math.min((usedBytes / totalBytes) * 100, 100) : 0;
  const tone = TONE_THRESHOLDS.find(t => percentUsed <= t.max) ?? TONE_THRESHOLDS[2];

  return (
    <div className="rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
          <HardDrive className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-fg leading-snug">
            Almacenamiento
          </h3>
          <p className="text-[11px] text-fg-muted mt-0.5">
            Cuota del workspace
          </p>
        </div>
      </div>

      {/* Numbers + bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[24px] font-bold text-fg tabular-nums leading-none">
            {isLoading ? "—" : formatBytes(usedBytes)}
          </span>
          <span className="text-[11px] text-fg-muted tabular-nums">
            de {isLoading ? "—" : formatBytes(totalBytes)}
          </span>
        </div>
        <Progress
          value={percentUsed}
          className="h-2 rounded-full bg-surface-muted"
          indicatorClassName={cn("rounded-full transition-all duration-500", tone.bar)}
        />
        <p className={cn("text-[11px] font-semibold tabular-nums", tone.text)}>
          {Math.round(percentUsed)}% utilizado
        </p>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-border-subtle">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> Archivos
          </p>
          <p className="text-[14px] font-semibold text-fg tabular-nums">
            {isLoading ? "—" : fileCount}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
            <Database className="h-3 w-3" /> Cuota
          </p>
          <p className={cn("text-[14px] font-semibold tabular-nums", tone.text)}>
            {Math.round(percentUsed)}%
          </p>
        </div>
      </div>
    </div>
  );
};
