import { Suspense, FC } from "react";

import { LoadingState } from "@/components/shared/LoadingState";
import { ReportsContent } from "@/features/reports/components";

const ReportsPage: FC = () => (
  <Suspense fallback={<LoadingState />}>
    <ReportsContent />
  </Suspense>
);

export default ReportsPage;