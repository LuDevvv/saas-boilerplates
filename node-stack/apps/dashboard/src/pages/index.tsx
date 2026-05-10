import { FC, Suspense } from "react";

import { DashboardContent } from "@/features/dashboard";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PageShell } from "@/features/admin/components/AdminPageShell";

const DashboardPage: FC = () => (
  <PageShell>
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  </PageShell>
);

export default DashboardPage;
