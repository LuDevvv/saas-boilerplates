import type {
  PaymentProvider,
  CreateCustomerData,
  CreateSubscriptionData,
  CheckoutData,
  Customer,
  Subscription,
  CheckoutUrl,
  WebhookEvent,
} from "../interfaces/payment-provider.interface.js";

export class MockProvider implements PaymentProvider {
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    return {
      id: `mock_cus_${Math.random().toString(36).substring(2, 15)}`,
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
      id: `mock_sub_${Math.random().toString(36).substring(2, 15)}`,
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
    console.log(`Mock: Canceling subscription ${subscriptionId}`);
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    return {
      id: subscriptionId,
      customerId: "mock_cus",
      planId: "mock_plan",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutUrl> {
    const sessionId = Math.random().toString(36).substring(2, 15);
    return {
      url: `http://localhost:4000/checkout/${sessionId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async handleWebhook(
    payload: any,
    _signatureOrHeaders?: string | Record<string, string>,
  ): Promise<WebhookEvent> {
    return {
      id: `mock_evt_${Math.random().toString(36).substring(2, 15)}`,
      type: "payment.succeeded",
      timestamp: new Date(),
      data: payload,
      processed: true,
    };
  }
}
