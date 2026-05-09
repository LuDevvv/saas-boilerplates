import { Ticket } from "@node-stack/types";
import { priorityConfig, statusConfig } from "../config";
import { cn } from "@/utils/classNames";
import { Link } from "react-router-dom";
import { ChevronRight, Clock, User, Timer } from "lucide-react";
import { StatusPill } from "@node-stack/ui";

interface TicketCardProps {
  ticket: Ticket;
  /** Compact variant for kanban / dense list. */
  compact?: boolean;
}

// ─── SLA mock helper ─────────────────────────────────────────────────────────
// Mock: derive a fake "due in X" from the ticket priority. Replace with real SLA data when available.
const getMockSla = (
  ticket: Ticket
): { label: string; tone: "danger" | "warning" | "neutral"; pulse?: boolean } | null => {
  if (ticket.status === "resolved" || ticket.status === "closed") return null;
  if (ticket.priority === "critical") return { label: "Vence en 30m", tone: "danger", pulse: true };
  if (ticket.priority === "high") return { label: "Vence en 2h", tone: "warning", pulse: true };
  if (ticket.priority === "medium") return { label: "Vence en 24h", tone: "neutral" };
  return null;
};

export const TicketCard = ({ ticket, compact = false }: TicketCardProps) => {
  const prio = priorityConfig[ticket.priority];
  const status = statusConfig[ticket.status];
  const sla = getMockSla(ticket);

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className={cn(
        "group relative flex flex-col gap-3 p-4 bg-surface rounded-[16px] border border-border transition-all duration-200",
        "hover:border-border-strong hover:shadow-[var(--shadow-card)]",
        !compact && "md:flex-row md:items-center md:gap-6 md:p-6"
      )}
    >
      <div className="flex-1 min-w-0">
        {/* Top row: priority + ID + SLA */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              prio.chip
            )}
          >
            {prio.label}
          </span>
          <span className="text-[10px] font-bold text-fg-muted uppercase tracking-wider">
            #{ticket.id.slice(-6).toUpperCase()}
          </span>
          {sla && (
            <StatusPill label={sla.label} tone={sla.tone} pulse={sla.pulse} />
          )}
        </div>

        <h3
          className={cn(
            "font-semibold text-fg leading-snug truncate group-hover:text-primary transition-colors",
            compact ? "text-[14px]" : "text-[15px] md:text-[16px]"
          )}
        >
          {ticket.subject}
        </h3>

        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", compact ? "mt-2" : "mt-3")}>
          <div className="flex items-center gap-1.5 text-[11px] text-fg-secondary">
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
            {status.label}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
            <Clock className="h-3 w-3" />
            Hace 2h
          </div>
          {ticket.assignedTo && (
            <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
              <User className="h-3 w-3" />
              {ticket.assignedTo}
            </div>
          )}
          {sla && !compact && (
            <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
              <Timer className="h-3 w-3" />
              SLA monitoreado
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div className="flex items-center justify-end">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-fg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}
    </Link>
  );
};
