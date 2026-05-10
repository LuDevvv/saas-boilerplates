import { Download, Activity, User, FileText } from "lucide-react";
import { FC } from "react";

import { getActionColor } from "./getActionIcon";

import { type AuditLog } from "@/features/admin";
import { cn } from "@/utils/classNames";


interface AuditLogCardProps {
  log: AuditLog;
}

export const AuditLogCard: FC<AuditLogCardProps> = ({ log }) => {
  const getActionIcon = (action: string) => {
    if (action.includes("export") || action.includes("download")) return Download;
    if (action.includes("delete")) return Activity;
    if (action.includes("role") || action.includes("user")) return User;
    return FileText;
  };

  const Icon = getActionIcon(log.action);
  const iconColor = getActionColor(log.action);

  return (
    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center hover:bg-surface-hover transition-colors">
      <div className="h-9 w-9 rounded-[10px] bg-surface-muted border border-border flex items-center justify-center shrink-0">
        <Icon size={16} className={cn(iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-fg font-label capitalize">
            {log.action.replace(/_/g, " ")}
          </span>
          {log.entityType && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-hover text-fg-secondary border border-border-subtle uppercase ">
              {log.entityType}
            </span>
          )}
        </div>
        <div className="text-sm text-fg-secondary flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1">
            <User size={12} /> {log.userId ?? "Sistema"}
          </span>
          {log.entityId && (
            <span className="flex items-center gap-1">
              <FileText size={12} /> ID: {log.entityId.slice(0, 8)}
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm text-fg-secondary">
          {new Date(log.createdAt).toLocaleDateString()}
        </div>
        <div className="text-xs text-fg-muted">
          {new Date(log.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
