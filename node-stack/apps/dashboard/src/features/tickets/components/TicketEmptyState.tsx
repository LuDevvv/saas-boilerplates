import { Inbox } from "lucide-react";
import { Button, EmptyState } from "@node-stack/ui";
import { statusConfig } from "../config";

interface TicketEmptyStateProps {
  activeTab: string;
  onCreateTicket: () => void;
}

export const TicketEmptyState = ({ activeTab, onCreateTicket }: TicketEmptyStateProps) => (
  <EmptyState
    icon={Inbox}
    title="Bandeja vacía"
    description={
      activeTab === "all"
        ? "Aún no has creado ningún ticket de soporte. Nuestro equipo está listo para ayudarte."
        : `No tienes tickets registrados con el estado "${
            statusConfig[activeTab as keyof typeof statusConfig]?.label
          }".`
    }
    action={
      <Button
        onClick={onCreateTicket}
        className="rounded-xl bg-primary hover:bg-primary-600 px-5 h-10 text-[13px] font-medium text-primary-foreground transition-colors active:scale-95 shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)]"
      >
        Crear mi primer ticket
      </Button>
    }
  />
);
