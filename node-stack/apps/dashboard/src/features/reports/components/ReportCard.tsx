import { FC } from "react";
import type { StorageFile } from "@/features/storage";
import { cn } from "@/utils/classNames";
import { FileText, Download, Trash2 } from "lucide-react";

interface ReportCardProps {
  report: StorageFile;
  onDownload: (report: StorageFile) => void;
  onDelete: (id: string) => void;
}

const formatSize = (bytes: number) => {
  if (!bytes) return "0 MB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const ReportCard: FC<ReportCardProps> = ({ report, onDownload, onDelete }) => {
  const isReady = report.status === "Ready";

  return (
    <tr className="group hover:bg-surface-hover transition-colors">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-fg-muted group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary transition-all duration-300">
            <FileText size={18} />
          </div>
          <span className="text-sm font-heading text-fg">{report.name}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="px-2.5 py-0.5 bg-surface-muted rounded-full text-[10px] font-bold text-fg-muted uppercase tracking-wider border border-border-subtle">
          {report.type.split("/")[1]?.toUpperCase() || report.type}
        </span>
      </td>
      <td className="px-6 py-5 text-xs font-label text-fg-secondary">
        {new Date(report.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-5 text-xs font-label text-fg-secondary tabular-nums">
        {formatSize(report.size)}
      </td>
      <td className="px-6 py-5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase border",
            isReady
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          )}
        >
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
            )}
          />
          {report.status}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => onDownload(report)}
            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-90"
            title="Descargar"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => onDelete(report.id)}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};
