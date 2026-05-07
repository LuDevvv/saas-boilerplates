import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateTicketDto, TicketStatus } from "@node-stack/types";

export const useTickets = (params?: { page?: number; limit?: number; status?: TicketStatus }) => {
  return useQuery({
    queryKey: ["tickets", "list", params],
    queryFn: () => api.tickets.list(params),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ["tickets", "detail", id],
    queryFn: () => api.tickets.get(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CreateTicketDto>({
    mutationFn: (data) => api.tickets.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useAddTicketMessage = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (body) => api.tickets.addMessage(ticketId, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "detail", ticketId] });
    },
  });
};

export const useUpdateTicketStatus = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, TicketStatus>({
    mutationFn: (status) => api.tickets.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "detail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
    },
  });
};