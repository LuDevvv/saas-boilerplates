import { Suspense } from "react";

import { AuditLogsContent } from "@/features/admin/components/AuditLogs/AuditLogsContent";
import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { AuditLogsSkeleton } from "@/features/admin/components/AdminSkeletons";

const AuditLogs = () => (
  <AdminPageShell>
    <Suspense fallback={<AuditLogsSkeleton />}>
      <AuditLogsContent />
    </Suspense>
  </AdminPageShell>
);

export default AuditLogs;
