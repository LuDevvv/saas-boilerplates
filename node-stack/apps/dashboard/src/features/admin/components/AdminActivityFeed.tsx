import { Activity, Loader2 } from "lucide-react";
import { FC } from "react";

import { useAuditLogs } from "../hooks";

export const AdminActivityFeed: FC = () => {
  const { data: auditLogsResponse, isLoading } = useAuditLogs({ limit: 10 });
  const auditLogs = auditLogsResponse?.data ?? [];

  return (
    <div className="rounded-[20px] border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading text-fg">Actividad Reciente</h3>
        <Activity className="h-5 w-5 text-fg-muted" />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-fg-muted" />
          </div>
        ) : auditLogs?.length === 0 ? (
          <p className="text-center text-sm text-fg-muted py-10">No hay actividad reciente.</p>
        ) : (
          auditLogs?.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors"
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  activity.action.includes("user")
                    ? "bg-emerald-500"
                    : activity.action.includes("login")
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-label text-fg truncate">
                  <span className="font-bold">{activity.userEmail || activity.userId}</span> {activity.action.replace(/\./g, ' ')}
                </p>
              </div>
              <span className="text-[11px] text-fg-muted font-label shrink-0">
                {new Date(activity.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
