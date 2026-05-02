import { FC } from "react";
import { Card, Progress } from "@node-stack/ui";
import { HardDrive, FileText, Database } from "lucide-react";
import { formatBytes } from "@/utils/formatters";

interface StorageStatsProps {
  usedBytes: number;
  totalBytes: number;
  fileCount: number;
  isLoading: boolean;
}

export const StorageStats: FC<StorageStatsProps> = ({ usedBytes, totalBytes, fileCount, isLoading }) => {
  const percentUsed = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

  return (
    <Card className="p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-primary-50 dark:bg-primary-500/5 rounded-xl">
          <HardDrive className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-sm font-heading text-slate-900 dark:text-white uppercase">Almacenamiento</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-kpi text-slate-900 dark:text-white">
              {isLoading ? "..." : formatBytes(usedBytes)}
            </span>
            <span className="text-xs font-label text-slate-400">
              de {isLoading ? "..." : formatBytes(totalBytes)}
            </span>
          </div>
          <Progress value={percentUsed} className="h-2 rounded-full bg-slate-100 dark:bg-white/5" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] font-heading text-slate-400 uppercase flex items-center gap-1.5">
              <FileText size={10} /> Archivos
            </p>
            <p className="text-sm font-label text-slate-900 dark:text-white">{isLoading ? "-" : fileCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-heading text-slate-400 uppercase flex items-center gap-1.5">
              <Database size={10} /> Cuota
            </p>
            <p className="text-sm font-label text-slate-900 dark:text-white">{Math.round(percentUsed)}% usado</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
