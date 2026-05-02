import { FC, useState } from "react";
import { Plus } from "lucide-react";
import { useTickets, TicketStatus } from "../index";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StatusTabs } from "./StatusTabs";
import { TicketSearch } from "./TicketSearch";
import { TicketList } from "./TicketList";
import { TicketEmptyState } from "./TicketEmptyState";
import { TicketLoadingState } from "./TicketLoadingState";
import { TicketErrorState } from "./TicketErrorState";
import CreateTicketModal from "./CreateTicketModal";

const TicketsContent: FC = () => {
  const [activeTab, setActiveTab] = useState<TicketStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useTickets({
    status: activeTab === "all" ? undefined : activeTab,
  });

  const tickets = data?.data || [];

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1600px] mx-auto pb-20 px-4 md:px-6 animate-fade-in">
      <SectionHeader
        title="Soporte Técnico"
        subtitle="Gestiona tus tickets de soporte y comunícate con nuestro equipo experto."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-heading text-white shadow-xl shadow-blue-900/20 hover:bg-primary-700 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2 group"
          >
            <Plus className="h-5 w-5" />
            Nuevo Ticket
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <StatusTabs activeTab={activeTab} onChange={setActiveTab} />
        <TicketSearch />
      </div>

      {isLoading ? (
        <TicketLoadingState />
      ) : error ? (
        <TicketErrorState />
      ) : tickets.length > 0 ? (
        <TicketList tickets={tickets} />
      ) : (
        <TicketEmptyState activeTab={activeTab} onCreateTicket={() => setIsModalOpen(true)} />
      )}

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default TicketsContent;