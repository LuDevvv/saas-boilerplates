import { FC } from "react";
import { History as HistoryIcon, Clock, ChevronRight } from "lucide-react";
import { Card } from "@node-stack/ui";
import { AuditLogItem } from "../types";

const mockAuditItems: AuditLogItem[] = [
  { id: "1", description: "Actualización de Domicilio Fiscal", date: "Hace 2 días", author: "Administrador" },
  { id: "2", description: "Cambio de razón social", date: "Hace 1 semana", author: "Administrador" },
];

export const AuditLog: FC = () => (
  <Card className="card-premium">
    <div className="flex items-center justify-between px-6 md:px-8 py-5 md:py-6 border-b border-gray-50 dark:border-white/5">
      <div className="flex items-center gap-3">
        <HistoryIcon className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-heading text-gray-950 dark:text-white">Cambios Recientes</h2>
      </div>
      <button className="text-[11px] font-label text-primary hover:underline uppercase">Ver Auditoría</button>
    </div>
    <div className="divide-y divide-gray-50 dark:divide-white/5">
      {mockAuditItems.map((item) => (
        <div key={item.id} className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-heading text-gray-950 dark:text-white">{item.description}</p>
              <div className="flex items-center gap-1.5 text-[10px] font-label text-gray-400">
                <span>{item.date} • Por: {item.author}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300" />
        </div>
      ))}
    </div>
  </Card>
);