import type {
  CheckoutResponse,
  CreateCheckoutDto,
  Subscription,
} from "@node-stack/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";


import { billing } from "../billing.js";
import { apiClient } from "../client.js";

const billingApi = billing(apiClient);

// ─── Plans (public — no auth token required) ─────────────────────────────────

export function usePlans(
  options?: Omit<UseQueryOptions<unknown>, "queryKey" | "queryFn">,
) {
  return useQuery<unknown>({
    queryKey: ["billing-plans"],
    // TODO: type properly once GET /billing/plans is added to the OpenAPI spec
    queryFn: () => apiClient.get("/api/v1/billing/plans") as Promise<unknown>,
    ...options,
  });
}

// ─── Subscription ────────────────────────────────────────────────────────────

export function useSubscription(
  workspaceId: string,
  options?: Omit<UseQueryOptions<Subscription | null>, "queryKey" | "queryFn">,
) {
  return useQuery<Subscription | null>({
    queryKey: ["subscription", workspaceId],
    queryFn: () => billingApi.getSubscription() as Promise<Subscription | null>,
    enabled: Boolean(workspaceId),
    ...options,
  });
}

// ─── Checkout ────────────────────────────────────────────────────────────────

export function useCreateCheckout() {
  const qc = useQueryClient();
  return useMutation<CheckoutResponse, Error, CreateCheckoutDto>({
    mutationFn: (data) => billingApi.createCheckout(data) as Promise<CheckoutResponse>,
    onSuccess: (_res, vars) => {
      // Invalidate subscription for the relevant workspace
      if ("workspaceId" in vars && typeof vars.workspaceId === "string") {
        qc.invalidateQueries({ queryKey: ["subscription", vars.workspaceId] });
      }
    },
  });
}
