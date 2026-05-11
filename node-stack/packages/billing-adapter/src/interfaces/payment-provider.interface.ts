export interface CreateCustomerData {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionData {
  customerId: string;
  planId: string;
  variantId?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutData {
  customerId?: string;
  email?: string;
  name?: string;
  billingCountry?: string;  // ISO 3166-1 alpha-2, e.g. "DO" — pre-fills billing address country
  planId: string;
  variantId?: string;
  successUrl: string;
  cancelUrl: string;
  /** Origin of the embedding page (e.g. "https://app.example.com") — required for embedded checkout iframe messaging */
  embedOrigin?: string;
  /** BCP 47 locale code for checkout UI language (e.g. "es") — beta feature */
  locale?: string;
  /** Show discount code input in the checkout form (default: true) */
  allowDiscountCodes?: boolean;
  metadata?: Record<string, string>;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  variantId?: string;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

export interface CheckoutUrl {
  url: string;
  expiresAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: Date;
  data: unknown;
  processed: boolean;
}

export type WebhookEventType =
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled"
  | "payment.succeeded"
  | "payment.failed"
  | "customer.created";

export interface BillingOrder {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  productName?: string;
  invoiceUrl?: string;
}

export interface PaymentProvider {
  createCustomer(data: CreateCustomerData): Promise<Customer>;
  createSubscription(data: CreateSubscriptionData): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  upgradeSubscription(subscriptionId: string, productId: string): Promise<void>;
  uncancelSubscription(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<Subscription>;
  createCheckoutSession(data: CheckoutData): Promise<CheckoutUrl>;
  createCustomerSession(customerId: string): Promise<{ token: string; customerPortalUrl?: string }>;
  listOrders(customerSessionToken: string, limit?: number): Promise<BillingOrder[]>;
  handleWebhook(
    payload: unknown,
    signatureOrHeaders?: string | Record<string, string>,
  ): Promise<WebhookEvent>;

  /**
   * Ingest a meter event for a customer. Used for usage-based billing.
   *
   * @param externalCustomerId  Workspace/customer ID in YOUR system (Polar links it via external_customer_id)
   * @param eventName           Event name that the meter's filter matches on (e.g. "api_call")
   * @param value               Numeric value to aggregate (default 1 for count meters)
   * @param metadata            Optional key/value pairs attached to the event
   */
  ingestMeterEvent(
    externalCustomerId: string,
    eventName: string,
    value?: number,
    metadata?: Record<string, string>,
  ): Promise<void>;
}
