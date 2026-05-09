import { EmptyState } from "@node-stack/ui";
import { ScrollText } from "lucide-react";
import { FC } from "react";

export const AuditLogEmptyState: FC = () => (
  <EmptyState
    icon={ScrollText}
    title="Sin registros recientes"
    description="No hay actividad registrada en este momento. Las acciones críticas aparecerán aquí cuando se ejecuten."
    compact
  />
);
