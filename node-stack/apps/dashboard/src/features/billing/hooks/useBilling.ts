import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { 
  Subscription, 
  Invoice, 
  CheckoutResponse, 
  PortalResponse, 
  PaymentMethod,
  CreateCheckoutDto
} from "@node-stack/types";

export const useSubscription = () => {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  return useQuery<Subscription | null, Error>({
    queryKey: queryKeys.billing.subscription(),
    queryFn: () => api.billing.getSubscription(),
    enabled: !!workspaceId,
  });
};

export const useInvoices = () => {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  return useQuery<Invoice[], Error>({
    queryKey: queryKeys.billing.invoices(),
    queryFn: () => api.billing.listInvoices() as any,
    enabled: !!workspaceId,
  });
};

export const usePaymentMethods = () => {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  return useQuery<PaymentMethod[], Error>({
    queryKey: queryKeys.billing.paymentMethods(),
    queryFn: () => { return [] as PaymentMethod[]; }, // Stubbed since it's not in controller
    enabled: !!workspaceId,
  });
};

export const useCheckout = () => {
  return useMutation<CheckoutResponse, Error, CreateCheckoutDto>({
    mutationFn: (data: CreateCheckoutDto) =>
      api.billing.createCheckout(data),
  });
};

export const useCustomerPortal = () => {
  return useMutation<PortalResponse, Error, { returnUrl: string }>({
    // returnUrl is not accepted by the backend portal endpoint in this version
    mutationFn: () => api.billing.getPortalUrl(),
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<Subscription, Error, { cancelAtPeriodEnd?: boolean }>({
    mutationFn: (_body) => { throw new Error("Not implemented in backend") }, // Stubbed since it's not in controller
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
    },
  });
};