import { PageHeader } from "@node-stack/ui";
import { Plus, LayoutGrid, List as ListIcon } from "lucide-react";
import { FC, useState, useMemo } from "react";

import { useTickets, TicketStatus } from "../index";
import CreateTicketModal from "./CreateTicketModal";
import { StatusTabs } from "./StatusTabs";
import { TicketEmptyState } from "./TicketEmptyState";
import { TicketErrorState } from "./TicketErrorState";
import { TicketKanban } from "./TicketKanban";
import { TicketList } from "./TicketList";
import { TicketLoadingState } from "./TicketLoadingState";
import { TicketSearch } from "./TicketSearch";

import { cn } from "@/utils/classNames";

type ViewMode = "list" | "kanban";

const TicketsContent: FC = () => {
  const [activeTab, setActiveTab] = useState<TicketStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useTickets({
    status: activeTab === "all" ? undefined : activeTab,
  });

  const allTickets = data?.data || [];

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allTickets;
    return allTickets.filter(
      (t) => t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    );
  }, [allTickets, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allTickets.length };
    for (const t of allTickets) c[t.status] = (c[t.status] ?? 0) + 1;
    return c as Record<TicketStatus | "all", number>;
  }, [allTickets]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-20 px-4 md:px-6 animate-fade-in">
      <PageHeader
        eyebrow="SOPORTE"
        title="Bandeja de tickets"
        description="Gestiona tus tickets de soporte tipo Inbox: filtra, asigna y responde sin perder contexto."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-primary hover:bg-primary-600 px-5 h-10 text-[13px] font-medium text-primary-foreground transition-all active:scale-95 shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)] flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nuevo ticket
          </button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <StatusTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />
        <div className="flex items-center gap-2">
          <TicketSearch value={search} onChange={setSearch} />
          <div className="flex items-center gap-0.5 rounded-xl border border-border bg-surface-muted p-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                view === "list" ? "bg-surface text-fg shadow-[var(--shadow-sm)]" : "text-fg-muted hover:text-fg-secondary"
              )}
              title="Vista de lista"
            >
              <ListIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                view === "kanban" ? "bg-surface text-fg shadow-[var(--shadow-sm)]" : "text-fg-muted hover:text-fg-secondary"
              )}
              title="Vista kanban"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <TicketLoadingState />
      ) : error ? (
        <TicketErrorState />
      ) : filteredTickets.length === 0 ? (
        <TicketEmptyState activeTab={activeTab} onCreateTicket={() => setIsModalOpen(true)} />
      ) : view === "kanban" ? (
        <TicketKanban tickets={filteredTickets} />
      ) : (
        <TicketList tickets={filteredTickets} />
      )}

      <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TicketsContent;
