import { FC, lazy, Suspense } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

const ApiKeysFeature = lazy(() => import("@features/api-keys/pages/ApiKeysPage"));

const ApiKeysPage: FC = () => {
  return (
    <Suspense fallback={<LoadingState message="Cargando claves API..." />}>
      <ApiKeysFeature />
    </Suspense>
  );
};

export default ApiKeysPage;
