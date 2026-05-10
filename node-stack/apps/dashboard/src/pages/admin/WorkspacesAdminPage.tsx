import { Suspense } from "react";

import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { WorkspacesAdminSkeleton } from "@/features/admin/components/AdminSkeletons";
import { WorkspacesAdminContent } from "@/features/admin/components/WorkspacesAdmin/WorkspacesAdminContent";

const WorkspacesAdminPage = () => (
  <AdminPageShell>
    <Suspense fallback={<WorkspacesAdminSkeleton />}>
      <WorkspacesAdminContent />
    </Suspense>
  </AdminPageShell>
);

export default WorkspacesAdminPage;
