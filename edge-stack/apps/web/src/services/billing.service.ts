import { client } from "../lib/api";
import type { ISubscriptionStatus } from "../types";

/**
 * Service to handle billing and subscription-related API interactions.
 */
export const BillingService = {
  /**
   * Fetches current subscription status for the active workspace.
   */
  async getSubscriptionStatus(): Promise<ISubscriptionStatus> {
    try {
      const res = await client.api.billing.subscription.$get();
      if (!res.ok) throw new Error("Failed to fetch subscription status");

      const result = (await res.json()) as {
        success: boolean;
        data: ISubscriptionStatus;
      };
      return result.data;
    } catch (error) {
      console.error("[BillingService] getSubscriptionStatus error:", error);
      throw error;
    }
  },

  /**
   * Initiates a checkout session.
   */
  async createCheckout(
    workspaceId: string,
    variantId: string,
  ): Promise<{ success: boolean; data: { url: string } }> {
    try {
      const res = await client.api.billing.checkout.$post({
        json: {
          workspaceId,
          productId: variantId,
          redirectUrl:
            window.location.origin + "/dashboard/billing?success=true",
        },
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      return await res.json();
    } catch (error) {
      console.error("[BillingService] createCheckout error:", error);
      throw error;
    }
  },

  /**
   * Gets a customer portal URL.
   */
  async getCustomerPortal(): Promise<{
    success: boolean;
    data: { url: string };
  }> {
    try {
      const res = await client.api.billing.portal.$post({
        json: {},
      });
      if (!res.ok) throw new Error("Failed to get customer portal link");
      return await res.json();
    } catch (error) {
      console.error("[BillingService] getCustomerPortal error:", error);
      throw error;
    }
  },
};
