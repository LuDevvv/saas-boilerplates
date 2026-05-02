import { Inbox } from "lucide-react";
import { statusConfig } from "../api/tickets.api";

interface TicketEmptyStateProps {
  activeTab: string;
  onCreateTicket: () => void;
}

export const TicketEmptyState = ({ activeTab, onCreateTicket }: TicketEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-[32px] border border-gray-100 bg-white/80 backdrop-blur-md py-24 px-8 dark:border-white/10 dark:bg-gray-900/50 shadow-sm">
    <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-primary-50 dark:bg-primary-500/10 mb-8 transform group-hover:rotate-6 transition-transform">
      <Inbox className="h-10 w-10 text-primary-300" />
    </div>
    <h3 className="text-2xl font-heading text-gray-950 dark:text-white ">Bandeja Vacía</h3>
    <p className="mt-2 text-gray-500 dark:text-gray-400 text-center max-w-sm font-label leading-relaxed">
      {activeTab === "all"
        ? "Aún no has creado ningún ticket de soporte. Nuestro equipo está listo para ayudarte."
        : `No tienes tickets registrados con el estado "${statusConfig[activeTab as keyof typeof statusConfig]?.label}".`}
    </p>
    <button
      onClick={onCreateTicket}
      className="mt-8 rounded-2xl bg-primary-600 px-8 py-4 text-sm font-heading text-white shadow-xl shadow-blue-900/20 hover:bg-primary-700 hover:scale-105 transition-all active:scale-95"
    >
      Crear mi primer ticket
    </button>
  </div>
);