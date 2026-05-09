import { FC } from "react";

export const ReportLoadingState: FC = () => {
  return (
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
          <tbody className="divide-y divide-border-subtle">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td colSpan={6} className="px-6 py-6 h-16 bg-surface-muted/40"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
