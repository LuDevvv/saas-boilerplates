import { FC, ReactNode } from "react";

import { ReportCard } from "./ReportCard";
import { ReportEmptyState } from "./ReportEmptyState";

import type { StorageFile } from "@/features/storage";

interface ReportListProps {
  reports: StorageFile[];
  isLoading: boolean;
  onDownload: (report: StorageFile) => void;
  onDelete: (id: string) => void;
  onCreateFirst: () => void;
}

const TableShell: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)] overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-subtle bg-surface-muted">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-fg-muted">Nombre del Reporte</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-fg-muted">Formato</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-fg-muted">Creado el</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-fg-muted">Tamaño</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-fg-muted">Estado</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-fg-muted text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">{children}</tbody>
      </table>
    </div>
  </div>
);

export const ReportList: FC<ReportListProps> = ({
  reports,
  isLoading,
  onDownload,
  onDelete,
  onCreateFirst,
}) => {
  if (isLoading) {
    return (
      <TableShell>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="animate-pulse">
            <td colSpan={6} className="px-6 py-6 h-16 bg-surface-muted/40"></td>
          </tr>
        ))}
      </TableShell>
    );
  }

  if (reports.length === 0) {
    return <ReportEmptyState onCreateFirst={onCreateFirst} />;
  }

  return (
    <TableShell>
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </TableShell>
  );
};
