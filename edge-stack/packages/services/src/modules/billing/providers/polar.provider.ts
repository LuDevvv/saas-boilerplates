import { Polar } from "@polar-sh/sdk";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import {
  type CheckoutParams,
  type PaymentProvider,
  type CustomerPortalParams,
} from "../billing.types";

/**
 * Payment provider implementation for Polar.sh.
 * Optimized for Edge runtimes using the official Polar SDK.
 */
export const createPolarProvider = (
  accessToken: string,
  webhookSecret: string,
  server: "sandbox" | "production" = "production",
): PaymentProvider => {
  const polar = new Polar({ accessToken, server });

  return {
    /**
     * Initializes a checkout session with Polar.sh.
     */
    async createCheckout(params: CheckoutParams) {
      const checkout = await polar.checkouts.create({
        products: [params.variantId],
        successUrl: params.redirectUrl || "",
        customerEmail: params.userEmail,
        metadata: {
          user_id: params.userId,
          workspace_id: params.workspaceId,
        },
      });

      return { url: checkout.url };
    },

    /**
     * Verifies the authenticity of Polar.sh webhooks.
     * Polar follows the Standard Webhooks spec (webhook-id, webhook-timestamp, webhook-signature).
     */
    async verifyWebhook(
      headers: Record<string, string>,
      rawBody: string,
    ): Promise<boolean> {
      try {
        // Polar SDK provides a validation helper
        validateEvent(rawBody, headers, webhookSecret);
        return true;
      } catch (error) {
        console.error("[Polar] Webhook verification failed:", error);
        return false;
      }
    },

    /**
     * Generates a customer billing portal URL via Polar.sh.
     */
    async getCustomerPortalUrl(
      params: CustomerPortalParams,
    ): Promise<{ url: string }> {
      const session = await polar.customerSessions.create({
        customerId: params.providerCustomerId,
      });

      return { url: session.customerPortalUrl };
    },

    /**
     * Retrieves a list of successful orders/invoices from Polar.sh.
     */
    async listInvoices(params: CustomerPortalParams) {
      const orders = await polar.orders.list({
        customerId: params.providerCustomerId,
      });

      return orders.result.items.map((order) => ({
        id: order.id,
        number: order.id.slice(0, 8).toUpperCase(),
        amount: order.totalAmount, // Polar SDK uses camelCase
        currency: order.currency,
        status: "paid",
        createdAt: order.createdAt.toISOString(),
        hostedInvoiceUrl: null,
      }));
    },
  };
};
