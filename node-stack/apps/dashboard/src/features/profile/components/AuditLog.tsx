import { FC } from "react";
import { History as HistoryIcon, Clock, ChevronRight, User } from "lucide-react";
import { Card, EmptyState } from "@node-stack/ui";
import { AuditLogItem } from "../types";

interface AuditLogProps {
  items?: AuditLogItem[];
}

export const AuditLog: FC<AuditLogProps> = ({ items = [] }) => (
  <Card className="overflow-hidden border-border shadow-sm rounded-2xl bg-surface backdrop-blur-md flex flex-col min-h-[280px]">
    <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-[#004080]/5 flex items-center justify-center text-[#004080] dark:text-cyan-400">
          <HistoryIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-fg uppercase">Trazabilidad de la Compañía</h2>
          <p className="text-[10px] font-medium text-slate-400 uppercase">Auditoría SOC2</p>
        </div>
      </div>
      {items.length > 0 && (
        <button className="text-[10px] font-black text-[#004080] dark:text-cyan-400 hover:bg-[#004080]/5 px-3 py-1.5 rounded-lg uppercase">Ver Historial</button>
      )}
    </div>
    
    <div className="flex-1 flex flex-col">
      {items.length > 0 ? (
        <div className="divide-y divide-border-subtle">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4 dark:hover:bg-white/[0.01] gap-4 cursor-pointer">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-700/30 border border-border flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-[13px] font-bold text-fg truncate">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 uppercase">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      <span>{item.author}</span>
                    </div>
                    <span className="opacity-30">•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <EmptyState
            compact
            variant="minimal"
            icon={HistoryIcon}
            title="Sin actividad de auditoría"
            description="Los registros de trazabilidad SOC2 aparecerán aquí a medida que se realicen cambios en la compañía."
            className="max-w-xs"
          />
        </div>
      )}
    </div>
  </Card>
);