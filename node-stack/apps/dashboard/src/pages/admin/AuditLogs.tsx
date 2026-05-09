import { AuditLogsContent } from "@/features/admin/components/AuditLogs/AuditLogsContent";
import { AuditLogsPage } from "@/features/admin/components/AuditLogs/AuditLogsPage";

const AuditLogs = () => {
  return (
    <AuditLogsPage>
      <AuditLogsContent />
    </AuditLogsPage>
  );
};

export default AuditLogs;