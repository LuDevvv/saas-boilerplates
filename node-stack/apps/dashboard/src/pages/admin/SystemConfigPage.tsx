import { lazy, Suspense } from "react";

import { PageSkeleton } from "@/components/shared/ErrorBoundary";

const SystemConfigContent = lazy(() =>
  import("@/features/admin/components/SystemConfig/SystemConfigContent").then((m) => ({
    default: m.SystemConfigContent,
  }))
);

const SystemConfigPage = () => (
  <Suspense fallback={<PageSkeleton />}>
    <SystemConfigContent />
  </Suspense>
);

export default SystemConfigPage;
