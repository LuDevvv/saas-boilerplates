import { AxiosInstance } from "axios";
import { 
  Ticket, 
  TicketListResponse, 
  CreateTicketDto, 
  UpdateTicketDto, 
  TicketStatus 
} from "@node-stack/types";

export const tickets = (client: AxiosInstance) => ({
  list: async (params?: { limit?: number; cursor?: string; status?: TicketStatus }) => {
    const { data } = await client.get<{ data: Ticket[]; nextCursor?: string }>("/ticket", { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await client.get<Ticket>(`/ticket/${id}`);
    return data;
  },

  create: async (data: CreateTicketDto) => {
    const { data: response } = await client.post<Ticket>("/ticket", data);
    return response;
  },

  update: async (id: string, data: UpdateTicketDto) => {
    const { data: response } = await client.patch<Ticket>(`/ticket/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const { data } = await client.delete<{ message: string }>(`/ticket/${id}`);
    return data.message;
  },

  addMessage: async (id: string, data: { body: string; attachments?: string[] }) => {
    const { data: response } = await client.post<any>(`/ticket/${id}/messages`, data);
    return response;
  },

  updateStatus: async (id: string, status: TicketStatus) => {
    const { data: response } = await client.patch<Ticket>(`/ticket/${id}`, { status });
    return response;
  },
});
