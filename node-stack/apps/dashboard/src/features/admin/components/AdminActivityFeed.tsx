import { FC } from "react";
import { Activity, Loader2 } from "lucide-react";
import { useAuditLogs } from "../hooks";

export const AdminActivityFeed: FC = () => {
  const { data: auditLogs, isLoading } = useAuditLogs();

  return (
    <div className="rounded-[24px] border border-gray-100 bg-white/80 backdrop-blur-md p-8 dark:border-white/10 dark:bg-gray-900/50 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-heading text-gray-950 dark:text-white">Actividad Reciente</h3>
        <Activity className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : auditLogs?.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No hay actividad reciente.</p>
        ) : (
          auditLogs?.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  activity.action.includes("user")
                    ? "bg-green-500"
                    : activity.action.includes("login")
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-label text-gray-950 dark:text-white">
                  <span className="font-bold">{activity.userEmail || activity.userId}</span> {activity.action.replace(/\./g, ' ')}
                </p>
              </div>
              <span className="text-[11px] text-gray-400 font-label">{new Date(activity.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};