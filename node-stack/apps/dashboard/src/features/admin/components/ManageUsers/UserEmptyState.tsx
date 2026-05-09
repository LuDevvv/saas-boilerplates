import { EmptyState } from "@node-stack/ui";
import { Users } from "lucide-react";
import { FC } from "react";

export const UserEmptyState: FC = () => (
  <EmptyState
    icon={Users}
    title="Sin usuarios"
    description="No se encontraron usuarios. Cuando se registren, aparecerán aquí."
  />
);
