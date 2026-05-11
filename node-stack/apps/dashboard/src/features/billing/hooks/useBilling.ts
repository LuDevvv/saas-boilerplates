import type {
  Invoice,
  CheckoutResponse,
  PortalResponse,
  CreateCheckoutDto,
  BillingSubscription,
  BillingPlan,
  ChangePlanDto,
} from "@node-stack/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useWorkspaceStore } from "@/stores/workspaceStore";

export const useSubscription = () => {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  return useQuery<BillingSubscription | null, Error>({
    queryKey: queryKeys.billing.subscription(),
    queryFn: () => api.billing.getSubscription(),
    enabled: !!workspaceId,
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useInvoices = () => {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  return useQuery<Invoice[], Error>({
    queryKey: queryKeys.billing.invoices(),
    queryFn: () => api.billing.listInvoices(),
    enabled: !!workspaceId,
  });
};

export const usePlans = () => {
  return useQuery<BillingPlan[], Error>({
    queryKey: queryKeys.billing.plans(),
    queryFn: () => api.billing.getPlans(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckout = () => {
  return useMutation<CheckoutResponse, Error, CreateCheckoutDto>({
    mutationFn: (data: CreateCheckoutDto) =>
      api.billing.createCheckout(data),
  });
};

export const useCustomerPortal = () => {
  return useMutation<PortalResponse, Error, { section?: string }>({
    mutationFn: ({ section } = {}) => api.billing.getPortalUrl(section),
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => api.billing.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
    },
  });
};

export const useUncancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => api.billing.uncancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
    },
  });
};

export const useRefreshSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<BillingSubscription, Error, void>({
    mutationFn: () => api.billing.refreshSubscription(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.billing.subscription(), data);
    },
  });
};

export const useChangePlan = () => {
  const queryClient = useQueryClient();
  return useMutation<BillingSubscription, Error, ChangePlanDto>({
    mutationFn: (data) => api.billing.changePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
    },
  });
};