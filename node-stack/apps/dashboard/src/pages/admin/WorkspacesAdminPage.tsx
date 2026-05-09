import { lazy, Suspense } from "react";

import { PageSkeleton } from "@/components/shared/ErrorBoundary";

const WorkspacesAdminContent = lazy(() =>
  import("@/features/admin/components/WorkspacesAdmin/WorkspacesAdminContent").then((m) => ({
    default: m.WorkspacesAdminContent,
  }))
);

const WorkspacesAdminPage = () => (
  <Suspense fallback={<PageSkeleton />}>
    <WorkspacesAdminContent />
  </Suspense>
);

export default WorkspacesAdminPage;
