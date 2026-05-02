import { Suspense, FC } from "react";
import { ReportsContent } from "@/features/reports/components";
import { LoadingState } from "@/components/shared/LoadingState";

const ReportsPage: FC = () => (
  <Suspense fallback={<LoadingState />}>
    <ReportsContent />
  </Suspense>
);

export default ReportsPage;