import { Suspense } from "react";
import { AdminContent } from "@/features/admin/components";
import { LoadingState } from "@/components/shared/LoadingState";

const AdminOverview = () => (
  <Suspense fallback={<LoadingState />}>
    <AdminContent />
  </Suspense>
);

export default AdminOverview;
