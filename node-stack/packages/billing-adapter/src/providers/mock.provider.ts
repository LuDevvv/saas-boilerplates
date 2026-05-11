import type {
  PaymentProvider,
  CreateCustomerData,
  CreateSubscriptionData,
  CheckoutData,
  Customer,
  Subscription,
  CheckoutUrl,
  WebhookEvent,
  BillingOrder,
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

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    return;
  }

  async upgradeSubscription(_subscriptionId: string, _productId: string): Promise<void> {
    return;
  }

  async uncancelSubscription(_subscriptionId: string): Promise<void> {
    return;
  }

  async createCustomerSession(_customerId: string): Promise<{ token: string; customerPortalUrl?: string }> {
    return { token: "mock_session_token", customerPortalUrl: undefined };
  }

  async listOrders(_customerSessionToken: string, _limit?: number): Promise<BillingOrder[]> {
    return [
      {
        id: "mock_ord_001",
        number: "MOCK0001",
        amount: 2900,
        currency: "usd",
        status: "paid",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        productName: "Growth (Monthly)",
        invoiceUrl: undefined,
      },
    ];
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

  async createCheckoutSession(_data: CheckoutData): Promise<CheckoutUrl> {
    const sessionId = Math.random().toString(36).substring(2, 15);
    return {
      url: `http://localhost:4000/checkout/${sessionId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async handleWebhook(
    payload: unknown,
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
