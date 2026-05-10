import { 
  Subscription, 
  CreateCheckoutDto,
  CheckoutResponse,
  PortalResponse,
  Invoice
} from "@node-stack/types";
import { AxiosInstance } from "axios";

export const billing = (client: AxiosInstance) => ({
  getSubscription: async () => {
    return (await client.get<Subscription | null>("/billing/subscription")).data;
  },

  createCheckout: async (data: CreateCheckoutDto) => {
    return (await client.post<CheckoutResponse>("/billing/checkout", data)).data;
  },

  getPortalUrl: async () => {
    return (await client.get<PortalResponse>("/billing/portal")).data;
  },

  listInvoices: async () => {
    return (await client.get<Invoice[]>("/billing/invoices")).data;
  },
});
