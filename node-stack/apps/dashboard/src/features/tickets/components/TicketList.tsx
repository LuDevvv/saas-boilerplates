import { Ticket } from "../api/tickets.api";
import { TicketCard } from "./TicketCard";

interface TicketListProps {
  tickets: Ticket[];
}

export const TicketList = ({ tickets }: TicketListProps) => (
  <div className="grid gap-5">
    {tickets.map((ticket) => (
      <TicketCard key={ticket.id} ticket={ticket} />
    ))}
  </div>
);