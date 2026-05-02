import { Suspense } from "react";
import { AnalyticsContent } from "@/features/analytics";
import { LoadingState } from "@/components/shared/LoadingState";

const Analytics = () => (
  <Suspense fallback={<LoadingState />}>
    <AnalyticsContent />
  </Suspense>
);

export default Analytics;