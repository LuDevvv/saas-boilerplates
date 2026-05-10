import { Suspense } from "react";

import { FeatureFlagsContent } from "@/features/admin/components/FeatureFlags/FeatureFlagsContent";
import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { FeatureFlagsSkeleton } from "@/features/admin/components/AdminSkeletons";

const FeatureFlagsPage = () => (
  <AdminPageShell>
    <Suspense fallback={<FeatureFlagsSkeleton />}>
      <FeatureFlagsContent />
    </Suspense>
  </AdminPageShell>
);

export default FeatureFlagsPage;
