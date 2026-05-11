import {
  CreateCheckoutDto,
  CheckoutResponse,
  PortalResponse,
  Invoice,
  BillingSubscription,
  BillingPlan,
  ChangePlanDto,
} from "@node-stack/types";
import { AxiosInstance } from "axios";

// The createClient response interceptor already unwraps response.data.
// Accessing .data again would return undefined. Return the awaited result directly.
export const billing = (client: AxiosInstance) => ({
  getSubscription: async (): Promise<BillingSubscription | null> => {
    const r = await client.get("/billing/subscription");
    return r as unknown as BillingSubscription | null;
  },

  createCheckout: async (data: CreateCheckoutDto): Promise<CheckoutResponse> => {
    const r = await client.post("/billing/checkout", data);
    return r as unknown as CheckoutResponse;
  },

  getPortalUrl: async (section?: string): Promise<PortalResponse> => {
    const params = section ? `?section=${section}` : "";
    const r = await client.get(`/billing/portal${params}`);
    return r as unknown as PortalResponse;
  },

  listInvoices: async (): Promise<Invoice[]> => {
    const r = await client.get("/billing/invoices");
    return r as unknown as Invoice[];
  },

  cancelSubscription: async (): Promise<void> => {
    await client.delete("/billing/subscription");
  },

  changePlan: async (data: ChangePlanDto): Promise<BillingSubscription> => {
    const r = await client.patch("/billing/subscription", data);
    return r as unknown as BillingSubscription;
  },

  getPlans: async (): Promise<BillingPlan[]> => {
    const r = await client.get("/billing/plans");
    return r as unknown as BillingPlan[];
  },
});
