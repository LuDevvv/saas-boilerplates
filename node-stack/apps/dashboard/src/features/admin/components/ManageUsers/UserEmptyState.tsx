import { FC } from "react";
import { Users } from "lucide-react";
import { EmptyState } from "@node-stack/ui";

export const UserEmptyState: FC = () => (
  <EmptyState
    icon={Users}
    title="Sin usuarios"
    description="No se encontraron usuarios. Cuando se registren, aparecerán aquí."
  />
);
