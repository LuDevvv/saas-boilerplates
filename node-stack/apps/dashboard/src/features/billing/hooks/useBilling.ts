import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { billingApi, type SubscriptionInfo, type Invoice, type CheckoutResponse, type PortalResponse } from "../api/billing.api";

export const useSubscription = () => {
  return useQuery<SubscriptionInfo, Error>({
    queryKey: queryKeys.billing.subscription(),
    queryFn: () => billingApi.getSubscription(),
  });
};

export const useInvoices = () => {
  return useQuery<Invoice[], Error>({
    queryKey: queryKeys.billing.invoices(),
    queryFn: () => billingApi.getInvoices(),
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: queryKeys.billing.paymentMethods(),
    queryFn: () => billingApi.getPaymentMethods(),
  });
};

export const useCheckout = () => {
  return useMutation<CheckoutResponse, Error, string>({
    mutationFn: (planId: string) => billingApi.createCheckout(planId),
  });
};

export const useCustomerPortal = () => {
  return useMutation<PortalResponse, Error>({
    mutationFn: () => billingApi.getCustomerPortal(),
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => billingApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription() });
    },
  });
};