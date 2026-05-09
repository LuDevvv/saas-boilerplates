import { FC } from "react";
import type { Ticket, TicketStatus } from "@node-stack/types";
import { kanbanColumns, statusConfig } from "../config";
import { TicketCard } from "./TicketCard";
import { cn } from "@/utils/classNames";

interface TicketKanbanProps {
  tickets: Ticket[];
}

export const TicketKanban: FC<TicketKanbanProps> = ({ tickets }) => {
  const groups: Record<TicketStatus, Ticket[]> = {
    open: [],
    in_progress: [],
    resolved: [],
    closed: [],
  };

  for (const t of tickets) {
    if (t.status in groups) groups[t.status].push(t);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {kanbanColumns.map((col) => {
        const items = groups[col.key];
        const status = statusConfig[col.key];
        return (
          <div
            key={col.key}
            className="flex flex-col gap-3 rounded-[20px] border border-border bg-surface-muted p-3 min-h-[400px]"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("h-2 w-2 rounded-full shrink-0", status.dotColor)} />
                <h3 className="text-[13px] font-semibold text-fg truncate">{col.label}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-fg-muted shrink-0">
                  {col.description}
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-bold tabular-nums text-fg-muted bg-surface border border-border rounded-md px-1.5 py-0.5">
                {items.length}
              </span>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-2.5">
              {items.length === 0 ? (
                <div className="flex items-center justify-center text-center text-[11px] text-fg-muted py-12 border border-dashed border-border rounded-xl">
                  Sin tickets
                </div>
              ) : (
                items.map((t) => <TicketCard key={t.id} ticket={t} compact />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
