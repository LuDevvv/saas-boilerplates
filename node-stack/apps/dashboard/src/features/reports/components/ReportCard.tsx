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
  return (bytes / (10.24 * 10.24)).toFixed(1) + " MB";
};

export const ReportCard: FC<ReportCardProps> = ({ report, onDownload, onDelete }) => {
  return (
    <tr className="group hover:bg-primary-50/20 dark:hover:bg-primary-500/5 transition-all duration-300">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
            <FileText size={18} />
          </div>
          <span className="text-sm font-heading text-gray-900 dark:text-gray-100">{report.name}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded-full text-[9px] font-abel text-gray-600 dark:text-gray-400 uppercase border border-border-subtle">
          {report.type.split("/")[1]?.toUpperCase() || report.type}
        </span>
      </td>
      <td className="px-6 py-5 text-xs font-abel text-fg-secondary">
        {new Date(report.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-5 text-xs font-abel text-fg-secondary">
        {formatSize(report.size)}
      </td>
      <td className="px-6 py-5">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-abel uppercase",
          report.status === "Ready"
            ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
            : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            report.status === "Ready" ? "bg-green-500" : "bg-amber-500 animate-pulse"
          )} />
          {report.status}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => onDownload(report)}
            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/20 rounded-xl transition-all active:scale-90"
            title="Descargar"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => onDelete(report.id)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-all active:scale-90"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};