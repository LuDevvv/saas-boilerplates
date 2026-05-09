import { FC } from "react";
import { ScrollText } from "lucide-react";
import { EmptyState } from "@node-stack/ui";

export const AuditLogEmptyState: FC = () => (
  <EmptyState
    icon={ScrollText}
    title="Sin registros recientes"
    description="No hay actividad registrada en este momento. Las acciones críticas aparecerán aquí cuando se ejecuten."
    compact
  />
);
