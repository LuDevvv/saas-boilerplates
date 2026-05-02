export { ticketsApi } from "./api/tickets.api";
export type {
  Ticket,
  TicketMessage,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketListResponse,
  TicketListParams,
  CreateTicketData,
} from "./api/tickets.api";

export {
  useTickets,
  useTicket,
  useCreateTicket,
  useAddTicketMessage,
  useUpdateTicketStatus,
} from "./hooks";