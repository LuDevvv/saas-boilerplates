import { FC, useState, useEffect } from "react";
import { PageHeader } from "@node-stack/ui";
import { api } from "@/lib/api";
import { type AuditLog } from "@/features/admin";
import { AuditLogCard } from "./AuditLogCard";
import { AuditLogList } from "./AuditLogList";
import { AuditLogEmptyState } from "./AuditLogEmptyState";
import { AuditLogLoadingState } from "./AuditLogLoadingState";

export const AuditLogsContent: FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.admin.getAuditLogs();
        setLogs(response?.data ?? []);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="AUDIT"
        title="Registro de Auditoría"
        description="Monitorea las acciones críticas realizadas en la plataforma."
        className="mb-6"
      />

      <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <AuditLogLoadingState />
        ) : logs.length === 0 ? (
          <AuditLogEmptyState />
        ) : (
          <AuditLogList>
            {logs.map((log) => (
              <AuditLogCard key={log.id} log={log} />
            ))}
          </AuditLogList>
        )}
      </div>
    </>
  );
};
