import { Suspense } from "react";

import { PageShell } from "@/features/admin/components/AdminPageShell";
import { ProfileContent, ProfileLayoutSkeleton } from "@/features/profile";

const PersonalProfile = () => (
  <PageShell>
    <Suspense fallback={<ProfileLayoutSkeleton />}>
      <ProfileContent />
    </Suspense>
  </PageShell>
);

export default PersonalProfile;
