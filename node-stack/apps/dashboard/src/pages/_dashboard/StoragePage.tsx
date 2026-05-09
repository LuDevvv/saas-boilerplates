import { FC, lazy, Suspense } from "react";

import { LoadingState } from "@/components/shared/LoadingState";

const StorageFeature = lazy(() => import("@features/storage/pages/StoragePage"));

const StoragePage: FC = () => {
  return (
    <Suspense fallback={<LoadingState message="Cargando archivos..." />}>
      <StorageFeature />
    </Suspense>
  );
};

export default StoragePage;
