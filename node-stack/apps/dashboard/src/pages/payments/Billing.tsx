import { FC, Suspense } from "react";
import { BillingContent } from "@/features/billing";
import { LoadingState } from "@/components/shared/LoadingState";

const BillingPage: FC = () => {
  return (
    <Suspense fallback={<LoadingState message="Cargando información de pagos..." />}>
      <BillingContent />
    </Suspense>
  );
};

export default BillingPage;