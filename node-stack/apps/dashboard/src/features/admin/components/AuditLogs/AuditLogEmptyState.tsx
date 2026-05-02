import { FC } from "react";

export const AuditLogEmptyState: FC = () => {
  return (
    <div className="p-12 text-center">
      <p className="text-slate-500 italic">No hay registros de auditoría recientes.</p>
    </div>
  );
};