import { AxiosInstance } from "axios";
import { 
  Ticket, 
  CreateTicketDto, 
  UpdateTicketDto, 
  TicketStatus 
} from "@node-stack/types";

export const tickets = (client: AxiosInstance) => ({
  list: async (params?: {
    limit?: number;
    cursor?: string;
    status?: TicketStatus;
  }) => {
    return client.get<{ data: Ticket[]; nextCursor?: string }>("/ticket", {
      params,
    }) as unknown as Promise<{ data: Ticket[]; nextCursor?: string }>;
  },

  get: async (id: string) => {
    return client.get<Ticket>(`/ticket/${id}`) as unknown as Promise<Ticket>;
  },

  create: async (data: CreateTicketDto) => {
    return client.post<Ticket>("/ticket", data) as unknown as Promise<Ticket>;
  },

  update: async (id: string, data: UpdateTicketDto) => {
    return client.patch<Ticket>(`/ticket/${id}`, data) as unknown as Promise<Ticket>;
  },

  delete: async (id: string) => {
    return client.delete<{ message: string }>(`/ticket/${id}`) as unknown as Promise<{ message: string }>;
  },

  addMessage: async (
    id: string,
    data: { body: string; attachments?: string[] },
  ) => {
    return client.post<any>(`/ticket/${id}/messages`, data) as unknown as Promise<any>;
  },

  updateStatus: async (id: string, status: TicketStatus) => {
    return client.patch<Ticket>(`/ticket/${id}`, { status }) as unknown as Promise<Ticket>;
  },
});
