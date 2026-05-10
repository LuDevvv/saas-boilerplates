import { Suspense } from "react";

import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { SystemConfigSkeleton } from "@/features/admin/components/AdminSkeletons";
import { SystemConfigContent } from "@/features/admin/components/SystemConfig/SystemConfigContent";

const SystemConfigPage = () => (
  <AdminPageShell>
    <Suspense fallback={<SystemConfigSkeleton />}>
      <SystemConfigContent />
    </Suspense>
  </AdminPageShell>
);

export default SystemConfigPage;
