import { AlertCircle } from "lucide-react";

export const TicketErrorState = () => (
  <div className="flex flex-col items-center justify-center py-20 rounded-[32px] border border-dashed border-red-200 bg-red-50/20">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <p className="text-lg font-heading text-red-950 dark:text-red-200">Error de conexión</p>
    <p className="text-sm text-red-600/70">No pudimos sincronizar tus tickets. Reintenta en unos momentos.</p>
  </div>
);