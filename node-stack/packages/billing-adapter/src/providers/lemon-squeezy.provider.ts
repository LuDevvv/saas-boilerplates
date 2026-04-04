import type {
  PaymentProvider,
  CreateCustomerData,
  CreateSubscriptionData,
  CheckoutData,
  Customer,
  Subscription,
  CheckoutUrl,
  WebhookEvent,
} from "../interfaces/payment-provider.interface";

export class LemonSqueezyProvider implements PaymentProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    return {
      id: `lsq_cus_${Math.random().toString(36).substring(2, 15)}`,
      email: data.email,
      name: data.name,
      createdAt: new Date(),
      metadata: data.metadata,
    };
  }

  async createSubscription(
    data: CreateSubscriptionData,
  ): Promise<Subscription> {
    return {
      id: `lsq_sub_${Math.random().toString(36).substring(2, 15)}`,
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
    console.log(`LemonSqueezy: Canceling subscription ${subscriptionId}`);
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    return {
      id: subscriptionId,
      customerId: "lsq_cus_mock",
      planId: "lsq_plan_mock",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutUrl> {
    const sessionId = Math.random().toString(36).substring(2, 15);
    return {
      url: `https://lemonsqueezy.com/checkout/${sessionId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async handleWebhook(payload: unknown): Promise<WebhookEvent> {
    return {
      id: `lsq_evt_${Math.random().toString(36).substring(2, 15)}`,
      type: "payment.succeeded",
      timestamp: new Date(),
      data: payload,
      processed: true,
    };
  }
}
