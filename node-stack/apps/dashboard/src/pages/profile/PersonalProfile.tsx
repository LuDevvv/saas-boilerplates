import { Suspense } from "react";
import { ProfileContent, ProfileLayoutSkeleton } from "@/features/profile";

const PersonalProfile = () => (
  <Suspense fallback={<ProfileLayoutSkeleton />}>
    <ProfileContent />
  </Suspense>
);

export default PersonalProfile;