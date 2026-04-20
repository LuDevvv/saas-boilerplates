import { Polar } from "@polar-sh/sdk";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
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
  WebhookEventType,
} from "../interfaces/payment-provider.interface";

export interface PolarProviderConfig {
  accessToken: string;
  webhookSecret?: string;
  /** "sandbox" for development, "production" for live */
  server?: "sandbox" | "production";
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
  private readonly circuitBreaker: CircuitBreaker;

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

    this.client = new Polar({
      accessToken: config.accessToken,
      server: config.server ?? "production",
    });
    this.webhookSecret = config.webhookSecret;
    this.circuitBreaker = new CircuitBreaker(
      this.createCheckoutSessionInternal.bind(this),
      { failureThreshold: 5, recoveryTimeout: 30_000 },
    );
  }

  // ─── Customer Operations ─────────────────────────────────────────────

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    const result = await this.client.customers.create({
      email: data.email,
      name: data.name,
      metadata: data.metadata ?? {},
    });

    // Customer response is a discriminated union (Individual | Team).
    // We cast to `any` to safely access fields that differ in nullability.
    const c = result as any;
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
    // Polar's SDK creates subscriptions through checkout sessions,
    // not directly. This maps to Polar's subscription model.
    const sub = await this.client.subscriptions.get({
      id: data.customerId, // Workaround: resolve after checkout completes
    });

    return this.mapSubscription(sub);
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
      },
    });
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = await this.client.subscriptions.get({
      id: subscriptionId,
    });
    return this.mapSubscription(sub);
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

  /**
   * Verifies and parses an incoming webhook event from Polar.
   *
   * Uses the official `@polar-sh/sdk/webhooks` helper which validates
   * the Standard Webhooks headers (webhook-id, webhook-timestamp, webhook-signature).
   *
   * @param payload  Raw request body as string or Buffer
   * @param headers  Request headers object (must include Standard Webhooks headers)
   */
  async handleWebhook(
    payload: string | Buffer | Record<string, unknown>,
    signatureOrHeaders?: string | Record<string, string>,
  ): Promise<WebhookEvent> {
    const headers = typeof signatureOrHeaders === "object" ? signatureOrHeaders : {};
    // When no webhook secret is configured, skip verification (dev mode)
    if (!this.webhookSecret) {
      const raw =
        typeof payload === "string" || Buffer.isBuffer(payload)
          ? JSON.parse(payload.toString())
          : payload;
      return {
        id: raw?.id ?? `polar_evt_${Date.now()}`,
        type: this.mapEventType(raw?.type),
        timestamp: new Date(raw?.createdAt ?? Date.now()),
        data: raw,
        processed: true,
      };
    }

    try {
      const body =
        typeof payload === "string" || Buffer.isBuffer(payload)
          ? payload.toString()
          : JSON.stringify(payload);

      const event = validateEvent(
        body,
        headers as Record<string, string>,
        this.webhookSecret,
      );

      return {
        id: (event as any).id ?? `polar_evt_${Date.now()}`,
        type: this.mapEventType((event as any).type),
        timestamp: new Date((event as any).createdAt ?? Date.now()),
        data: event,
        processed: true,
      };
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        throw new Error(`Webhook signature verification failed: ${error.message}`);
      }
      throw error;
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  private mapSubscription(sub: any): Subscription {
    return {
      id: sub.id,
      customerId: sub.customerId ?? sub.customer_id,
      planId: sub.productId ?? sub.product_id ?? sub.planId ?? "",
      variantId: sub.priceId ?? sub.price_id ?? sub.variantId,
      status: this.mapSubscriptionStatus(sub.status),
      currentPeriodStart: sub.currentPeriodStart
        ? new Date(sub.currentPeriodStart)
        : undefined,
      currentPeriodEnd: sub.currentPeriodEnd
        ? new Date(sub.currentPeriodEnd)
        : undefined,
      cancelAt: sub.cancelAtPeriodEnd ? sub.currentPeriodEnd
        ? new Date(sub.currentPeriodEnd)
        : undefined : undefined,
      createdAt: new Date(sub.createdAt ?? Date.now()),
      metadata: sub.metadata,
    };
  }

  private mapSubscriptionStatus(
    status: string,
  ): Subscription["status"] {
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
