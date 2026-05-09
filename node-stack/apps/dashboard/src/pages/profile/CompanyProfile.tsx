import { Suspense } from "react";

import { CompanyContent, ProfileLayoutSkeleton } from "@/features/profile";

const CompanyProfile = () => (
  <Suspense fallback={<ProfileLayoutSkeleton />}>
    <CompanyContent />
  </Suspense>
);

export default CompanyProfile;