import { Suspense } from "react";
import { TicketsContent } from "@/features/tickets/components";
import { LoadingState } from "@/components/shared/LoadingState";

const TicketsPage = () => (
  <Suspense fallback={<LoadingState />}>
    <TicketsContent />
  </Suspense>
);

export default TicketsPage;
