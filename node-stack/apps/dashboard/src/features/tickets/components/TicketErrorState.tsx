import { AlertCircle } from "lucide-react";

export const TicketErrorState = () => (
  <div className="flex flex-col items-center justify-center py-20 rounded-[20px] border border-dashed border-red-500/25 bg-red-500/[0.04]">
    <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
      <AlertCircle className="h-6 w-6 text-red-500" />
    </div>
    <p className="text-lg font-heading text-fg">Error de conexión</p>
    <p className="text-sm text-fg-secondary mt-1">
      No pudimos sincronizar tus tickets. Reintenta en unos momentos.
    </p>
  </div>
);
