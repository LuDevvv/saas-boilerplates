import { AxiosInstance } from "axios";
import { createClient } from "./client";
import { z } from "zod";

export type SubscriptionStatus = 
  | "active" 
  | "canceled" 
  | "incomplete" 
  | "incomplete_expired" 
  | "past_due" 
  | "trialing" 
  | "unpaid" 
  | "paused" 
  | "pending";

export type PlanInterval = "day" | "week" | "month" | "year";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: PlanInterval;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "oxxo" | "paypal";
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  date: string;
  invoiceUrl: string;
  pdfUrl: string;
}

const CreateCheckoutSchema = z.object({
  planId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const billing = (client: AxiosInstance) => ({
  getSubscription: async (workspaceId: string) => {
    return await client.get<{ data: Subscription | null }>(`/workspaces/${workspaceId}/billing/subscription`);
  },

  getPlans: async () => {
    return await client.get<{ data: Plan[] }>("/billing/plans");
  },

  createCheckout: async (body: { planId: string; successUrl: string; cancelUrl: string }) => {
    return await client.post<{ data: { id: string; url: string } }>("/billing/checkout", CreateCheckoutSchema.parse(body));
  },

  getPortalUrl: async (workspaceId: string, returnUrl: string) => {
    return await client.post<{ data: { id: string; url: string } }>(`/workspaces/${workspaceId}/billing/portal`, { returnUrl });
  },

  cancelSubscription: async (workspaceId: string, body?: { cancelAtPeriodEnd?: boolean }) => {
    return await client.post<{ data: Subscription }>(`/workspaces/${workspaceId}/billing/subscription/cancel`, body || {});
  },

  resumeSubscription: async (workspaceId: string) => {
    return await client.post<{ data: Subscription }>(`/workspaces/${workspaceId}/billing/subscription/resume`);
  },

  listPaymentMethods: async (workspaceId: string) => {
    return await client.get<{ data: PaymentMethod[] }>(`/workspaces/${workspaceId}/billing/payment-methods`);
  },

  setDefaultPaymentMethod: async (workspaceId: string, body: { paymentMethodId: string }) => {
    return await client.post<{ data: PaymentMethod }>(`/workspaces/${workspaceId}/billing/payment-methods/default`, body);
  },

  deletePaymentMethod: async (workspaceId: string, paymentMethodId: string) => {
    return await client.delete<{ success: boolean }>(`/workspaces/${workspaceId}/billing/payment-methods/${paymentMethodId}`);
  },

  listInvoices: async (workspaceId: string, params?: { page?: number; limit?: number }) => {
    return await client.get<{ data: Invoice[]; meta: { page: number; limit: number; total: number } }>(`/workspaces/${workspaceId}/billing/invoices`, { params });
  },
});
