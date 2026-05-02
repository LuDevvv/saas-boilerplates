import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketsApi, type TicketListParams, type CreateTicketData, type TicketStatus } from "../api/tickets.api";

export const useTickets = (params?: TicketListParams) => {
  return useQuery({
    queryKey: ["tickets", "list", params],
    queryFn: () => ticketsApi.getTickets(params),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ["tickets", "detail", id],
    queryFn: () => ticketsApi.getTicket(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketData) => ticketsApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useAddTicketMessage = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => ticketsApi.addMessage(ticketId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "detail", ticketId] });
    },
  });
};

export const useUpdateTicketStatus = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TicketStatus) => ticketsApi.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "detail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
    },
  });
};