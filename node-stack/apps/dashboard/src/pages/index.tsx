import { FC, Suspense } from "react";
import { DashboardContent } from "@/features/dashboard";
import { LoadingState } from "@/components/shared/LoadingState";

const DashboardPage: FC = () => {
  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingState message="Cargando dashboard..." />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
};

export default DashboardPage;