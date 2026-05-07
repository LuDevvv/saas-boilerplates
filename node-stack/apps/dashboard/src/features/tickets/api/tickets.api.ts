import { apiClient } from "@/lib/api";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketCategory = "bug" | "feature" | "billing" | "general";

export const priorityConfig: Record<TicketPriority, { label: string; color: string; bg: string }> = {
  low: { label: "BAJA", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
  medium: { label: "MEDIA", color: "text-primary", bg: "bg-primary/10 dark:bg-primary/20" },
  high: { label: "ALTA", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  critical: { label: "CRÍTICA", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
};

export const statusConfig: Record<TicketStatus, { label: string; dot: string; color: string }> = {
  open: { label: "Abierto", dot: "bg-primary", color: "text-primary" },
  in_progress: { label: "En progreso", dot: "bg-amber-500", color: "text-amber-600" },
  resolved: { label: "Resuelto", dot: "bg-teal-500", color: "text-teal-600" },
  closed: { label: "Cerrado", dot: "bg-gray-400", color: "text-gray-500" },
};

export const statusTabs: { key: TicketStatus | "all"; label: string }[] = [
  { key: "all", label: "TODOS" },
  { key: "open", label: "ABIERTOS" },
  { key: "in_progress", label: "PROGRESO" },
  { key: "resolved", label: "RESUELTOS" },
  { key: "closed", label: "CERRADOS" },
];

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

export interface TicketListParams {
  page?: number;
  pageSize?: number;
  status?: TicketStatus;
}

export interface TicketListResponse {
  data: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}

export const ticketsApi = {
  getTickets: (params?: TicketListParams): Promise<TicketListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return apiClient.get(`/tickets${qs ? `?${qs}` : ""}`);
  },

  getTicket: (id: string): Promise<Ticket> =>
    apiClient.get(`/tickets/${id}`),

  createTicket: (data: CreateTicketData): Promise<Ticket> =>
    apiClient.post("/tickets", data),

  addMessage: (id: string, content: string): Promise<TicketMessage> =>
    apiClient.post(`/tickets/${id}/messages`, { content }),

  updateStatus: (id: string, status: TicketStatus): Promise<Ticket> =>
    apiClient.patch(`/tickets/${id}/status`, { status }),
};