import { Suspense } from "react";

import { PageShell } from "@/features/admin/components/AdminPageShell";
import { CompanyContent, ProfileLayoutSkeleton } from "@/features/profile";

const CompanyProfile = () => (
  <PageShell>
    <Suspense fallback={<ProfileLayoutSkeleton />}>
      <CompanyContent />
    </Suspense>
  </PageShell>
);

export default CompanyProfile;
