import { Polar } from "@polar-sh/sdk";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";

import { CircuitBreaker } from "../circuit-breaker.js";
import type {
  PaymentProvider,
  CreateCustomerData,
  CreateSubscriptionData,
  CheckoutData,
  Customer,
  Subscription,
  CheckoutUrl,
  WebhookEvent,
  WebhookEventType,
  BillingOrder,
} from "../interfaces/payment-provider.interface.js";

export interface PolarProviderConfig {
  accessToken: string;
  webhookSecret?: string;
  /** "sandbox" for development, "production" for live */
  server?: "sandbox" | "production";
}

interface PolarCustomerLike {
  id: string;
  email?: string | null;
  name?: string | null;
  createdAt: string | Date;
  metadata?: Record<string, string> | null;
}

interface PolarSubscriptionLike {
  id: string;
  status: string;
  customerId?: string;
  customer_id?: string;
  productId?: string;
  product_id?: string;
  planId?: string;
  priceId?: string;
  price_id?: string;
  variantId?: string;
  currentPeriodStart?: string | Date;
  currentPeriodEnd?: string | Date;
  cancelAtPeriodEnd?: boolean;
  createdAt?: string | Date;
  metadata?: Record<string, string>;
}

interface PolarEventLike {
  id?: string;
  type?: string;
  createdAt?: string | Date;
}

/**
 * Production-ready Polar.sh payment provider.
 *
 * Uses the official `@polar-sh/sdk` for all API calls and
 * `@polar-sh/sdk/webhooks` for HMAC-based webhook verification
 * (Standard Webhooks spec: webhook-id, webhook-timestamp, webhook-signature).
 */
export class PolarProvider implements PaymentProvider {
  private readonly client: Polar;
  private readonly webhookSecret?: string;
  private readonly server: "sandbox" | "production";
  private readonly accessToken: string;
  private readonly circuitBreaker: CircuitBreaker<[CheckoutData], CheckoutUrl>;

  constructor(config: PolarProviderConfig);
  /** @deprecated Use the config object form instead */
  constructor(apiKey: string, webhookSecret?: string);
  constructor(
    configOrApiKey: PolarProviderConfig | string,
    webhookSecret?: string,
  ) {
    const config: PolarProviderConfig =
      typeof configOrApiKey === "string"
        ? { accessToken: configOrApiKey, webhookSecret }
        : configOrApiKey;

    this.server = config.server ?? "production";
    this.accessToken = config.accessToken;
    this.client = new Polar({
      accessToken: config.accessToken,
      server: this.server,
    });
    this.webhookSecret = config.webhookSecret;
    this.circuitBreaker = new CircuitBreaker<[CheckoutData], CheckoutUrl>(
      this.createCheckoutSessionInternal.bind(this),
      { failureThreshold: 5, recoveryTimeout: 30_000 },
    );
  }

  private get apiBase(): string {
    return this.server === "sandbox"
      ? "https://sandbox-api.polar.sh"
      : "https://api.polar.sh";
  }

  private async polarFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.apiBase}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Polar API ${options?.method ?? "GET"} ${path} failed ${res.status}: ${body}`);
    }
    return res.json() as Promise<T>;
  }

  // ─── Customer Operations ─────────────────────────────────────────────

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    const result = await this.client.customers.create({
      email: data.email,
      name: data.name,
      metadata: data.metadata ?? {},
    });

    // Customer response is a discriminated union (Individual | Team).
    // Cast to a structural shape so downstream access is type-safe.
    const c = result as unknown as PolarCustomerLike;
    return {
      id: c.id,
      email: c.email ?? data.email,
      name: c.name ?? undefined,
      createdAt: new Date(c.createdAt),
      metadata: c.metadata ?? undefined,
    };
  }

  // ─── Subscription Operations ──────────────────────────────────────────

  async createSubscription(
    data: CreateSubscriptionData,
  ): Promise<Subscription> {
    const sub = await this.client.subscriptions.get({
      id: data.customerId,
    });
    return this.mapSubscription(sub as unknown as PolarSubscriptionLike);
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
      },
    });
  }

  async upgradeSubscription(subscriptionId: string, productId: string): Promise<void> {
    await this.client.subscriptions.update({
      id: subscriptionId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscriptionUpdate: { productId } as any,
    });
  }

  async uncancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: { cancelAtPeriodEnd: false },
    });
  }

  async createCustomerSession(customerId: string): Promise<{ token: string; customerPortalUrl?: string }> {
    const data = await this.polarFetch<{ token: string; customer_portal_url?: string }>(
      "/v1/customer-sessions",
      {
        method: "POST",
        body: JSON.stringify({ customer_id: customerId }),
      },
    );
    return { token: data.token, customerPortalUrl: data.customer_portal_url };
  }

  async ingestMeterEvent(
    externalCustomerId: string,
    eventName: string,
    value = 1,
    metadata: Record<string, string> = {},
  ): Promise<void> {
    await this.polarFetch("/v1/events", {
      method: "POST",
      body: JSON.stringify({
        name: eventName,
        external_customer_id: externalCustomerId,
        metadata: { ...metadata, value: String(value) },
      }),
    });
  }

  async listOrders(customerSessionToken: string, limit = 20): Promise<BillingOrder[]> {
    const res = await fetch(
      `${this.apiBase}/v1/customer-portal/orders?limit=${limit}&sorting=-created_at`,
      {
        headers: {
          Authorization: `Bearer ${customerSessionToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) return [];

    const body = (await res.json()) as { items?: Record<string, unknown>[] };
    return (body.items ?? []).map((o) => {
      const product = o["product"] as Record<string, unknown> | undefined;
      return {
        id: o["id"] as string,
        number: ((o["id"] as string) ?? "").slice(0, 8).toUpperCase(),
        amount: (o["amount"] as number) ?? 0,
        currency: (o["currency"] as string) ?? "usd",
        status: (o["status"] as string) ?? "paid",
        createdAt: new Date((o["createdAt"] as string) ?? Date.now()),
        productName: product?.["name"] as string | undefined,
        invoiceUrl: o["receiptUrl"] as string | undefined,
      };
    });
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = await this.client.subscriptions.get({
      id: subscriptionId,
    });
    return this.mapSubscription(sub as unknown as PolarSubscriptionLike);
  }

  // ─── Checkout ─────────────────────────────────────────────────────────

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutUrl> {
    return this.circuitBreaker.execute(data);
  }

  private async createCheckoutSessionInternal(
    data: CheckoutData,
  ): Promise<CheckoutUrl> {
    const session = await this.client.checkouts.create({
      products: [data.planId],
      successUrl: data.successUrl,
      ...(data.customerId && { customerId: data.customerId }),
      ...(data.email && { customerEmail: data.email }),
      ...(data.name && { customerName: data.name }),
      ...(data.billingCountry && {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customerBillingAddress: { country: data.billingCountry as any },
      }),
      // Required for embedded checkout iframe ↔ parent page messaging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(data.embedOrigin && { embedOrigin: data.embedOrigin as any }),
      // Checkout localization (Polar beta feature — no-op if not enabled for the org)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(data.locale && { locale: data.locale as any }),
      // Show discount code input in the checkout form
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allowDiscountCodes: (data.allowDiscountCodes ?? true) as any,
      metadata: data.metadata ?? {},
    });

    return {
      url: session.url,
      expiresAt: session.expiresAt
        ? new Date(session.expiresAt)
        : new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  // ─── Webhook Handling ─────────────────────────────────────────────────

  async handleWebhook(
    payload: unknown,
    signatureOrHeaders?: string | Record<string, string>,
  ): Promise<WebhookEvent> {
    const headers =
      typeof signatureOrHeaders === "object" ? signatureOrHeaders : {};

    if (!this.webhookSecret) {
      const raw = this.coerceToEventLike(payload);
      return {
        id: raw.id ?? `polar_evt_${Date.now()}`,
        type: this.mapEventType(raw.type),
        timestamp: new Date(raw.createdAt ?? Date.now()),
        data: raw,
        processed: true,
      };
    }

    try {
      const body =
        typeof payload === "string" || Buffer.isBuffer(payload)
          ? payload.toString()
          : JSON.stringify(payload);

      const event = validateEvent(body, headers, this.webhookSecret) as
        | PolarEventLike
        | unknown;
      const evt = event as PolarEventLike;

      return {
        id: evt.id ?? `polar_evt_${Date.now()}`,
        type: this.mapEventType(evt.type),
        timestamp: new Date(evt.createdAt ?? Date.now()),
        data: event,
        processed: true,
      };
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        throw new Error(
          `Webhook signature verification failed: ${error.message}`,
        );
      }
      throw error;
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  private coerceToEventLike(payload: unknown): PolarEventLike {
    if (typeof payload === "string" || Buffer.isBuffer(payload)) {
      try {
        return JSON.parse(payload.toString()) as PolarEventLike;
      } catch {
        return {};
      }
    }
    return (payload as PolarEventLike) ?? {};
  }

  private mapSubscription(sub: PolarSubscriptionLike): Subscription {
    return {
      id: sub.id,
      customerId: sub.customerId ?? sub.customer_id ?? "",
      planId: sub.productId ?? sub.product_id ?? sub.planId ?? "",
      variantId: sub.priceId ?? sub.price_id ?? sub.variantId,
      status: this.mapSubscriptionStatus(sub.status),
      currentPeriodStart: sub.currentPeriodStart
        ? new Date(sub.currentPeriodStart)
        : undefined,
      currentPeriodEnd: sub.currentPeriodEnd
        ? new Date(sub.currentPeriodEnd)
        : undefined,
      cancelAt: sub.cancelAtPeriodEnd
        ? sub.currentPeriodEnd
          ? new Date(sub.currentPeriodEnd)
          : undefined
        : undefined,
      createdAt: new Date(sub.createdAt ?? Date.now()),
      metadata: sub.metadata,
    };
  }

  private mapSubscriptionStatus(status: string): Subscription["status"] {
    const statusMap: Record<string, Subscription["status"]> = {
      active: "active",
      trialing: "trialing",
      past_due: "past_due",
      canceled: "canceled",
      cancelled: "canceled",
      unpaid: "unpaid",
      paused: "paused",
      incomplete: "unpaid",
      incomplete_expired: "canceled",
    };
    return statusMap[status] ?? "active";
  }

  private mapEventType(type?: string): WebhookEventType {
    const typeMap: Record<string, WebhookEventType> = {
      "subscription.created": "subscription.created",
      "subscription.updated": "subscription.updated",
      "subscription.canceled": "subscription.canceled",
      "subscription.deleted": "subscription.canceled",
      "subscription.active": "subscription.updated",
      "subscription.revoked": "subscription.canceled",
      "order.created": "payment.succeeded",
      "checkout.created": "payment.succeeded",
    };
    return typeMap[type ?? ""] ?? ("subscription.updated" as WebhookEventType);
  }
}
