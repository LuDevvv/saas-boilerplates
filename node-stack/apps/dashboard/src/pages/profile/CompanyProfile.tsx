import { Suspense } from "react";
import { CompanyContent } from "@/features/profile";
import { LoadingState } from "@/components/shared/LoadingState";

const CompanyProfile = () => (
  <Suspense fallback={<LoadingState />}>
    <CompanyContent />
  </Suspense>
);

export default CompanyProfile;