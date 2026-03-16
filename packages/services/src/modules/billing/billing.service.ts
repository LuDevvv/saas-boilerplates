import { SubscriptionRepository, type Database } from "@workspace/db";
import { type SubscriptionStatus } from "@workspace/db";
import { PolarWebhookSchema } from "@workspace/validators";
import {
  type StandardizedSubscriptionData,
  type PaymentProvider,
} from "./billing.types";
import { encrypt, decrypt } from "../../common/encryption";

/**
 * Service for orchestrating billing logic and status synchronization.
 * Decoupled from HTTP context for testability.
 */
export const createBillingService = (db: Database, encryptionKey?: string) => {
  return {
    /**
     * Synchronizes a subscription state using standardized data.
     * Maps external provider data to our internal multi-tenant schema.
     *
     * @param data - Standardized subscription data from Polar
     */
    syncSubscription: async (data: StandardizedSubscriptionData) => {
      // 1. Check for Idempotency
      const existing = await SubscriptionRepository.getSubscriptionByProviderId(
        db,
        data.providerSubscriptionId,
      );

      if (existing && existing.status === data.status) {
        return { success: true, workspaceId: data.workspaceId, skipped: true };
      }

      // 2. Sync Customer Mapping (Encrypted at rest)
      let providerCustomerId = data.providerCustomerId;
      if (encryptionKey) {
        providerCustomerId = await encrypt(
          data.providerCustomerId,
          encryptionKey,
        );
      }

      await SubscriptionRepository.upsertCustomer(db, {
        workspaceId: data.workspaceId,
        providerCustomerId,
      });

      // 3. Sync Subscription State
      await SubscriptionRepository.upsertSubscription(db, {
        workspaceId: data.workspaceId,
        providerSubscriptionId: data.providerSubscriptionId,
        planId: data.planId,
        variantId: data.variantId,
        status: data.status,
        nextPaymentAt: data.nextPaymentAt,
        endsAt: data.endsAt,
      });

      return { success: true, workspaceId: data.workspaceId, skipped: false };
    },

    /**
     * Retrieves the current subscription status for a workspace from the database.
     * Returns null if no active subscription exists.
     *
     * @param workspaceId - The workspace to check
     */
    getSubscriptionStatus: async (workspaceId: string) => {
      const subscription = await SubscriptionRepository.getActiveSubscription(
        db,
        workspaceId,
      );

      if (!subscription) {
        return {
          hasActiveSubscription: false,
          subscription: null,
        };
      }

      return {
        hasActiveSubscription: true,
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          variantId: subscription.variantId,
          status: subscription.status,
          nextPaymentAt: subscription.nextPaymentAt
            ? new Date(subscription.nextPaymentAt).toISOString()
            : null,
          endsAt: subscription.endsAt
            ? new Date(subscription.endsAt).toISOString()
            : null,
        },
      };
    },

    /**
     * Generates a customer portal URL using the active payment provider.
     * Looks up the customer mapping first, then delegates to the provider.
     *
     * @param workspaceId - The workspace requesting portal access
     * @param provider - The active PaymentProvider instance
     */
    getCustomerPortalUrl: async (
      workspaceId: string,
      provider: PaymentProvider,
    ) => {
      // Look up the provider customer ID via the repository
      const customer = await SubscriptionRepository.getCustomerByWorkspace(
        db,
        workspaceId,
      );

      if (!customer) {
        throw new Error("No customer mapping found for this workspace.");
      }

      let providerCustomerId = customer.providerCustomerId;
      if (encryptionKey && providerCustomerId.includes(":")) {
        // Only decrypt if it looks like encrypted format (iv:ciphertext)
        providerCustomerId = await decrypt(providerCustomerId, encryptionKey);
      }

      return provider.getCustomerPortalUrl({
        providerCustomerId,
      });
    },

    /**
     * Normalizes a Polar.sh webhook payload into standardized data.
     * Converts Polar's SDK types into internal domain models.
     *
     * @param payload - Raw webhook payload from Polar
     */
    normalizePolarPayload(payload: unknown): StandardizedSubscriptionData {
      const { data } = PolarWebhookSchema.parse(payload);

      if (!data || !data.metadata || !data.metadata.workspace_id) {
        throw new Error("Invalid Polar payload: Missing metadata.workspace_id");
      }

      // Map Polar statuses to our internal enum to prevent NeonDbErrors
      // Note: Polar uses 'trialing', we use 'trialling' (double 'L')
      const statusMap: Record<string, SubscriptionStatus> = {
        active: "active",
        trialing: "trialling",
        trialling: "trialling",
        past_due: "past_due",
        cancelled: "cancelled",
        unpaid: "unpaid",
        paused: "paused",
        // Fallbacks for order-related statuses if they leak here
        paid: "active",
        succeeded: "active",
        completed: "active",
      };

      const status = statusMap[data.status] || "active";

      return {
        workspaceId: data.metadata.workspace_id,
        userId: data.metadata.user_id,
        providerSubscriptionId: data.id,
        providerCustomerId: data.customer_id || data.metadata.customer_id,
        planId: data.product_id,
        variantId: data.product_id,
        status,
        nextPaymentAt: data.current_period_end
          ? new Date(data.current_period_end)
          : null,
        endsAt: data.ends_at ? new Date(data.ends_at) : null,
      };
    },

    /**
     * List invoices for a workspace using the active payment provider.
     */
    listInvoices: async (workspaceId: string, provider: PaymentProvider) => {
      const customer = await SubscriptionRepository.getCustomerByWorkspace(
        db,
        workspaceId,
      );

      if (!customer) {
        return []; // No customer, no invoices
      }

      let providerCustomerId = customer.providerCustomerId;
      if (encryptionKey && providerCustomerId.includes(":")) {
        providerCustomerId = await decrypt(providerCustomerId, encryptionKey);
      }

      return provider.listInvoices({
        providerCustomerId,
      });
    },
  };
};
