import { 
  Subscription, 
  CreateCheckoutDto,
  CheckoutResponse,
  PortalResponse,
  Invoice
} from "@node-stack/types";
import { AxiosInstance } from "axios";

// The createClient response interceptor already unwraps response.data.
// Accessing .data again would return undefined. Return the awaited result directly.
export const billing = (client: AxiosInstance) => ({
  getSubscription: async (): Promise<Subscription | null> => {
    const r = await client.get("/billing/subscription");
    return r as unknown as Subscription | null;
  },

  createCheckout: async (data: CreateCheckoutDto): Promise<CheckoutResponse> => {
    const r = await client.post("/billing/checkout", data);
    return r as unknown as CheckoutResponse;
  },

  getPortalUrl: async (): Promise<PortalResponse> => {
    const r = await client.get("/billing/portal");
    return r as unknown as PortalResponse;
  },

  listInvoices: async (): Promise<Invoice[]> => {
    const r = await client.get("/billing/invoices");
    return r as unknown as Invoice[];
  },
});
