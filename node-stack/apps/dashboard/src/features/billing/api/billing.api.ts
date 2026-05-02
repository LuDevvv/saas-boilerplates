import { apiClient } from "@/shared/lib/api";

export interface SubscriptionInfo {
  status: string;
  planId: string;
  planName: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  created: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export const billingApi = {
  createCheckout: (planId: string): Promise<CheckoutResponse> =>
    apiClient.post("/billing/checkout", { planId }),

  getSubscription: (): Promise<SubscriptionInfo> =>
    apiClient.get("/billing/subscription"),

  getCustomerPortal: (): Promise<PortalResponse> =>
    apiClient.get("/billing/portal"),

  getInvoices: (): Promise<Invoice[]> =>
    apiClient.get("/billing/invoices"),

  getPaymentMethods: (): Promise<PaymentMethod[]> =>
    apiClient.get("/billing/payment-methods"),

  addPaymentMethod: (paymentMethodId: string): Promise<void> =>
    apiClient.post("/billing/payment-methods", { paymentMethodId }),

  setDefaultPaymentMethod: (paymentMethodId: string): Promise<void> =>
    apiClient.patch(`/billing/payment-methods/${paymentMethodId}/default`),

  deletePaymentMethod: (paymentMethodId: string): Promise<void> =>
    apiClient.delete(`/billing/payment-methods/${paymentMethodId}`),

  cancelSubscription: (): Promise<void> =>
    apiClient.post("/billing/subscription/cancel"),
};