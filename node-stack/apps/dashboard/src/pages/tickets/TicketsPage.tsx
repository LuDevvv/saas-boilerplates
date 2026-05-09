import { Suspense } from "react";

import { LoadingState } from "@/components/shared/LoadingState";
import { TicketsContent } from "@/features/tickets/components";

const TicketsPage = () => (
  <Suspense fallback={<LoadingState />}>
    <TicketsContent />
  </Suspense>
);

export default TicketsPage;
