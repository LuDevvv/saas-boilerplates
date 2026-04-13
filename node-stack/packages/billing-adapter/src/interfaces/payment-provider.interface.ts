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
  planId: string;
  variantId?: string;
  successUrl: string;
  cancelUrl: string;
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

export interface PaymentProvider {
  createCustomer(data: CreateCustomerData): Promise<Customer>;
  createSubscription(data: CreateSubscriptionData): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<Subscription>;
  createCheckoutSession(data: CheckoutData): Promise<CheckoutUrl>;
  handleWebhook(payload: any, signature?: string): Promise<WebhookEvent>;
}
