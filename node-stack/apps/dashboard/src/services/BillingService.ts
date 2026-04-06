import { BaseService } from "./baseService";
import type { 
  BillingDetailsResponse, 
  CheckoutSessionResponse, 
  PortalLinkResponse,
  CreateCheckoutParams 
} from "@/types/billing";

/**
 * Service for handling billing, subscriptions, and usage quotas.
 * Integrates with Stripe/Polar via the Node Stack backend.
 */
class BillingService extends BaseService {
  constructor() {
    super("/billing");
  }

  /**
   * Fetches current subscription status, usage, and available plans.
   */
  async getBillingDetails(): Promise<BillingDetailsResponse> {
    if (this.useMocks) {
      const response = await fetch("/mocks/billing.json");
      return response.json();
    }

    return this.get<BillingDetailsResponse>("/subscription");
  }

  /**
   * Generates a checkout session URL for the selected plan.
   * Redirects user to Stripe/Polar for payment.
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResponse> {
    if (this.useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return {
        checkoutUrl: "https://checkout.stripe.com/mock-session-id"
      };
    }

    return this.post<CheckoutSessionResponse>("/checkout", params);
  }

  /**
   * Generates a billing portal URL for self-service subscription management.
   */
  async getCustomerPortalUrl(): Promise<PortalLinkResponse> {
    if (this.useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        portalUrl: "https://billing.stripe.com/p/portal/mock-session"
      };
    }

    return this.get<PortalLinkResponse>("/portal");
  }
}

export const billingService = new BillingService();
