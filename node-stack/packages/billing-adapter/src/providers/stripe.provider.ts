import type {
  PaymentProvider,
  CreateCustomerData,
  CreateSubscriptionData,
  CheckoutData,
  Customer,
  Subscription,
  SubscriptionStatus,
  CheckoutUrl,
  WebhookEvent,
} from "../interfaces/payment-provider.interface";

export class StripeProvider implements PaymentProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    // Mock implementation - in production, use actual Stripe SDK
    return {
      id: `cus_${Math.random().toString(36).substring(2, 15)}`,
      email: data.email,
      name: data.name,
      createdAt: new Date(),
      metadata: data.metadata,
    };
  }

  async createSubscription(
    data: CreateSubscriptionData,
  ): Promise<Subscription> {
    // Mock implementation
    return {
      id: `sub_${Math.random().toString(36).substring(2, 15)}`,
      customerId: data.customerId,
      planId: data.planId,
      variantId: data.variantId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      metadata: data.metadata,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Mock implementation
    console.log(`Stripe: Canceling subscription ${subscriptionId}`);
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    // Mock implementation
    return {
      id: subscriptionId,
      customerId: "cus_mock",
      planId: "plan_mock",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutUrl> {
    // Mock implementation
    const sessionId = `cs_${Math.random().toString(36).substring(2, 15)}`;
    return {
      url: `https://checkout.stripe.com/c/pay/${sessionId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async handleWebhook(payload: unknown): Promise<WebhookEvent> {
    // Mock implementation
    return {
      id: `evt_${Math.random().toString(36).substring(2, 15)}`,
      type: "payment.succeeded",
      timestamp: new Date(),
      data: payload,
      processed: true,
    };
  }
}
