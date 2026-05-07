import { AxiosInstance } from "axios";
import { 
  Subscription, 
  CreateCheckoutDto,
  CheckoutResponse,
  PortalResponse,
  InvoicesResponse
} from "@node-stack/types";

export const billing = (client: AxiosInstance) => ({
  getSubscription: async () => {
    return client.get<Subscription | null>("/billing/subscription");
  },

  createCheckout: async (data: CreateCheckoutDto) => {
    return client.post<CheckoutResponse>("/billing/checkout", data);
  },

  getPortalUrl: async () => {
    return client.get<PortalResponse>("/billing/portal");
  },

  listInvoices: async () => {
    return client.get<InvoicesResponse>("/billing/invoices");
  },
});
