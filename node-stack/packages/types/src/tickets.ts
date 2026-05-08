import { PaginatedResponse } from "./domain/entities.js";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketCategory = "bug" | "feature" | "billing" | "general";

export interface CreateTicketDto {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}

export type UpdateTicketDto = Record<string, unknown>;

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isAdmin: boolean;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  workspaceId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

export type TicketListResponse = PaginatedResponse<Ticket>;
