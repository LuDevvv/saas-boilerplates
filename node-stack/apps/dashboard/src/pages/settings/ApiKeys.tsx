import { FC, lazy, Suspense } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

const ApiKeysPage = lazy(() => import("@features/api-keys/pages/ApiKeysPage"));

const ApiKeys: FC = () => {
  return (
    <Suspense fallback={<LoadingState message="Cargando claves API..." />}>
      <ApiKeysPage />
    </Suspense>
  );
};

export default ApiKeys;
