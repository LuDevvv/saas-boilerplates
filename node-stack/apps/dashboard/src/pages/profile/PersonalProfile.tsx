import { Suspense } from "react";
import { ProfileContent } from "@/features/profile";
import { LoadingState } from "@/components/shared/LoadingState";

const PersonalProfile = () => (
  <Suspense fallback={<LoadingState />}>
    <ProfileContent />
  </Suspense>
);

export default PersonalProfile;