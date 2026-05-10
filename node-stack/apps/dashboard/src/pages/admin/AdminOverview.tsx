import { Suspense } from "react";

import { AdminContent } from "@/features/admin/components";
import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { ControlCenterSkeleton } from "@/features/admin/components/AdminSkeletons";

const AdminOverview = () => (
  <AdminPageShell>
    <Suspense fallback={<ControlCenterSkeleton />}>
      <AdminContent />
    </Suspense>
  </AdminPageShell>
);

export default AdminOverview;
