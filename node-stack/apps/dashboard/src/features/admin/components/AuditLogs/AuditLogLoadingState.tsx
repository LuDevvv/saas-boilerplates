import { FC } from "react";
import { Loader2 } from "lucide-react";

export const AuditLogLoadingState: FC = () => {
  return (
    <div className="p-8 flex items-center justify-center gap-2 text-fg-muted text-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      Cargando registros...
    </div>
  );
};
