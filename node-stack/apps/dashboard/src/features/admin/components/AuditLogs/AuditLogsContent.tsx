import { FC, useState, useEffect } from "react";
import { SectionHeader } from "@/components/layout/SectionHeader";
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
        const data = await api.admin.getAuditLogs();
        setLogs(data);
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
      <SectionHeader
        title="Registro de Auditoría"
        subtitle="Monitorea las acciones críticas realizadas en la plataforma."
        tag="AUDIT"
        className="mb-8"
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
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