import { lazy, Suspense } from "react";
import { PageSkeleton } from "@/components/shared/ErrorBoundary";

const FeatureFlagsContent = lazy(() =>
  import("@/features/admin/components/FeatureFlags/FeatureFlagsContent").then((m) => ({
    default: m.FeatureFlagsContent,
  }))
);

const FeatureFlagsPage = () => (
  <Suspense fallback={<PageSkeleton />}>
    <FeatureFlagsContent />
  </Suspense>
);

export default FeatureFlagsPage;
