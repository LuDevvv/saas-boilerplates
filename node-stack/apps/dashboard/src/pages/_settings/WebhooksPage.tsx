import { FC, lazy, Suspense } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

const WebhooksFeature = lazy(() => import("@features/webhooks/pages/WebhooksPage"));

const WebhooksPage: FC = () => {
  return (
    <Suspense fallback={<LoadingState message="Cargando webhooks..." />}>
      <WebhooksFeature />
    </Suspense>
  );
};

export default WebhooksPage;
