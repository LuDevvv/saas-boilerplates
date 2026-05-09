import { FC, lazy, Suspense } from "react";

import { LoadingState } from "@/components/shared/LoadingState";

const WebhooksPage = lazy(() => import("@features/webhooks/pages/WebhooksPage"));

const Webhooks: FC = () => {
  return (
    <Suspense fallback={<LoadingState message="Cargando webhooks..." />}>
      <WebhooksPage />
    </Suspense>
  );
};

export default Webhooks;
