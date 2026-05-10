import { FC, Suspense } from "react";

import { PageShell } from "@/features/admin/components/AdminPageShell";
import { DashboardContent } from "@/features/dashboard";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";

const DashboardPage: FC = () => (
  <PageShell>
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  </PageShell>
);

export default DashboardPage;
