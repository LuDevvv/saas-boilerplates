import { Suspense } from "react";

import { LoadingState } from "@/components/shared/LoadingState";
import { AdminContent } from "@/features/admin/components";

const AdminOverview = () => (
  <Suspense fallback={<LoadingState />}>
    <AdminContent />
  </Suspense>
);

export default AdminOverview;
