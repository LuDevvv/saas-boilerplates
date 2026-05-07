import { Loader2 } from "lucide-react";

export const TicketLoadingState = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="relative">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
    </div>
  </div>
);