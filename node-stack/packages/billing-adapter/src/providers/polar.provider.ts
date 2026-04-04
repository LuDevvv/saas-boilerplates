import { CircuitBreaker } from "../circuit-breaker";
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

const POLAR_API = "https://api.polar.sh";

export class PolarProvider implements PaymentProvider {
  private apiKey: string;
  private webhookSecret?: string;
  private circuitBreaker: CircuitBreaker;

  constructor(apiKey: string, webhookSecret?: string) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.circuitBreaker = new CircuitBreaker(
      this.createCheckoutSessionInternal.bind(this),
      { failureThreshold: 5, recoveryTimeout: 30000 },
    );
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${POLAR_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Polar API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    const customer = await this.request<any>("POST", "/v1/customers", {
      email: data.email,
      name: data.name,
      metadata: data.metadata,
    });
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      createdAt: new Date(customer.created_at ?? Date.now()),
      metadata: data.metadata,
    };
  }

  async createSubscription(
    data: CreateSubscriptionData,
  ): Promise<Subscription> {
    const sub = await this.request<any>("POST", "/v1/subscriptions", {
      customer_id: data.customerId,
      plan_id: data.planId,
      variant_id: data.variantId,
      metadata: data.metadata,
    });
    return {
      id: sub.id,
      customerId: sub.customer_id,
      planId: sub.plan_id,
      variantId: sub.variant_id,
      status: sub.status as Subscription["status"],
      currentPeriodStart: sub.current_period_start
        ? new Date(sub.current_period_start)
        : undefined,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end)
        : undefined,
      createdAt: new Date(sub.created_at ?? Date.now()),
      metadata: data.metadata,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.request("POST", `/v1/subscriptions/${subscriptionId}/cancel`);
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const s = await this.request<any>(
      "GET",
      `/v1/subscriptions/${subscriptionId}`,
    );
    return {
      id: s.id,
      customerId: s.customer_id,
      planId: s.plan_id,
      variantId: s.variant_id,
      status: s.status as Subscription["status"],
      currentPeriodStart: s.current_period_start
        ? new Date(s.current_period_start)
        : undefined,
      currentPeriodEnd: s.current_period_end
        ? new Date(s.current_period_end)
        : undefined,
      createdAt: new Date(s.created_at ?? Date.now()),
      metadata: s.metadata,
    };
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutUrl> {
    return this.circuitBreaker.execute(data);
  }

  private async createCheckoutSessionInternal(
    data: CheckoutData,
  ): Promise<CheckoutUrl> {
    const session = await this.request<any>("POST", "/v1/checkouts", {
      plan_id: data.planId,
      variant_id: data.variantId,
      customer_id: data.customerId,
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: data.metadata,
    });
    return {
      url: session.url,
      expiresAt: new Date(session.expires_at ?? Date.now() + 30 * 60 * 1000),
    };
  }

  async handleWebhook(payload: unknown): Promise<WebhookEvent> {
    const event = payload as any;
    return {
      id: event?.id ?? `polar_evt_${Date.now()}`,
      type: event?.type ?? "unknown",
      timestamp: new Date(event?.timestamp ?? Date.now()),
      data: event,
      processed: true,
    } as WebhookEvent;
  }
}
