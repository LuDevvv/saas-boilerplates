import { Suspense } from "react";

import { WorkspacesAdminContent } from "@/features/admin/components/WorkspacesAdmin/WorkspacesAdminContent";
import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { WorkspacesAdminSkeleton } from "@/features/admin/components/AdminSkeletons";

const WorkspacesAdminPage = () => (
  <AdminPageShell>
    <Suspense fallback={<WorkspacesAdminSkeleton />}>
      <WorkspacesAdminContent />
    </Suspense>
  </AdminPageShell>
);

export default WorkspacesAdminPage;
