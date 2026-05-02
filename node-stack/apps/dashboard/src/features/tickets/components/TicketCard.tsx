import { Ticket } from "../api/tickets.api";
import { priorityConfig, statusConfig } from "../api/tickets.api";
import { cn } from "@/utils/classNames";
import { Link } from "react-router-dom";
import { ChevronRight, Clock, User } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard = ({ ticket }: TicketCardProps) => {
  const prio = priorityConfig[ticket.priority];
  const status = statusConfig[ticket.status];

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="group relative flex flex-col md:flex-row md:items-center gap-6 p-7 bg-white/80 backdrop-blur-md dark:bg-gray-900/50 rounded-[24px] border border-gray-100 dark:border-white/10 hover:scale-[1.01] hover:shadow-xl hover:border-primary-100 dark:hover:border-primary-500/20 transition-all duration-300 active:scale-[0.99]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-label uppercase  border", prio.bg, prio.color, "border-current/10")}>
            {prio.label}
          </span>
          <span className="text-[10px] font-label text-gray-400 uppercase ">
            ID #{ticket.id.slice(-6).toUpperCase()}
          </span>
        </div>

        <h3 className="text-lg font-heading text-gray-950 dark:text-white group-hover:text-primary-600 transition-colors truncate ">
          {ticket.subject}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-y-3 gap-x-8">
          <div className={cn("flex items-center gap-2 text-xs font-label", status.color)}>
            <div className={cn("h-2 w-2 rounded-full", status.dot)} />
            {status.label}
          </div>
          <div className="flex items-center gap-2 text-xs font-label text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Hace 2h
          </div>
          {ticket.assignedTo && (
            <div className="flex items-center gap-2 text-xs font-label text-gray-400">
              <User className="h-3.5 w-3.5" />
              Agente: {ticket.assignedTo}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-900/20 transition-all duration-300">
          <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};