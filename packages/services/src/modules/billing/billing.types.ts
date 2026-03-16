import { type SubscriptionStatus } from "@workspace/db";

/**
 * Standard parameters required to create a checkout session.
 */
export interface CheckoutParams {
  userId: string;
  workspaceId: string;
  userEmail: string;
  variantId: string;
  redirectUrl?: string;
}

/**
 * Standardized payment events emitted by providers.
 */
export type BillingEvent =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "order_created";

/**
 * Structure of the metadata sent by LemonSqueezy in webhooks.
 */
export interface LemonSqueezyMeta {
  event_name: BillingEvent;
  custom_data: {
    user_id: string;
    workspace_id: string;
  };
}

/**
 * Core attributes of a LemonSqueezy subscription object.
 */
export interface LemonSqueezySubscriptionAttributes {
  customer_id: number;
  status: string;
  product_id: number;
  variant_id: number;
  renews_at: string | null;
  ends_at: string | null;
  updated_at: string;
}

/**
 * Full LemonSqueezy Webhook Payload.
 */
export interface LemonSqueezyWebhookPayload {
  meta: LemonSqueezyMeta;
  data: {
    id: string; // The provider subscription ID
    type: string;
    attributes: LemonSqueezySubscriptionAttributes;
  };
}

/**
 * Standardized internal data for subscription synchronization.
 * Decouples the business logic from provider-specific JSON structures.
 */
export interface StandardizedSubscriptionData {
  workspaceId: string;
  userId: string;
  providerSubscriptionId: string;
  providerCustomerId: string;
  planId: string;
  variantId: string;
  status: SubscriptionStatus;
  nextPaymentAt: Date | null;
  endsAt: Date | null;
}

/**
 * Parameters for generating a customer portal URL.
 */
export interface CustomerPortalParams {
  providerCustomerId: string;
}

/**
 * The unified Payment Provider Adapter Interface.
 * Any payment gateway struct must strictly implement these methods to be interchangeable.
 */
export interface PaymentProvider {
  /**
   * Initializes a checkout session and returns a URL.
   * @param params User and product details
   * @returns A secure checkout URL
   */
  createCheckout(params: CheckoutParams): Promise<{ url: string }>;

  /**
   * Verifies the authenticity of incoming webhooks using signatures.
   * @param headers The headers from the request
   * @param rawBody The raw text body of the incoming webhook
   */
  verifyWebhook(
    headers: Record<string, string>,
    rawBody: string,
  ): Promise<boolean>;

  /**
   * Generates a URL for the customer self-service portal.
   * Allows users to manage billing details, update payment methods, and cancel.
   * @param params Provider customer identifier
   * @returns A portal URL for redirection
   */
  getCustomerPortalUrl(params: CustomerPortalParams): Promise<{ url: string }>;

  /**
   * Retrieves a list of invoices for a customer.
   * @param params Provider customer identifier
   * @returns A list of standardized invoice objects
   */
  listInvoices(params: CustomerPortalParams): Promise<StandardizedInvoice[]>;
}

/**
 * Standardized internal data for invoice summaries.
 */
export interface StandardizedInvoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  hostedInvoiceUrl?: string | null;
}
