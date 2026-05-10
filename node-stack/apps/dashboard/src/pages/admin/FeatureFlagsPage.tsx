import { Suspense } from "react";

import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { FeatureFlagsSkeleton } from "@/features/admin/components/AdminSkeletons";
import { FeatureFlagsContent } from "@/features/admin/components/FeatureFlags/FeatureFlagsContent";

const FeatureFlagsPage = () => (
  <AdminPageShell>
    <Suspense fallback={<FeatureFlagsSkeleton />}>
      <FeatureFlagsContent />
    </Suspense>
  </AdminPageShell>
);

export default FeatureFlagsPage;
