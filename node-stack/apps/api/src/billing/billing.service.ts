import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigService } from "@nestjs/config";
import type {
  PaymentProvider,
  CheckoutUrl,
  WebhookEvent,
  Subscription as ProviderSubscription,
} from "@node-stack/billing-adapter";
import { BillingRepository, type Subscription } from "@node-stack/db";
import { CacheService } from "@node-stack/cache";

import { CreateCheckoutDto } from "@node-stack/validators";
import { OutboxService } from "../common/services/outbox.service.js";
import { EncryptionService } from "../common/services/encryption.service.js";

/** Maps Polar SDK subscription statuses → our DB enums */
const STATUS_MAP: Record<string, Subscription["status"]> = {
  active: "active",
  trialing: "trialling",
  past_due: "past_due",
  canceled: "cancelled",
  cancelled: "cancelled",
  unpaid: "unpaid",
  paused: "paused",
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly outbox: OutboxService,
    private readonly billingRepo: BillingRepository,
    private readonly encryption: EncryptionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cache: CacheService,
    @Inject("PAYMENT_PROVIDER") private readonly provider: PaymentProvider,
  ) {}

  // ─── Checkout ─────────────────────────────────────────────────────────

  async createCheckout(
    data: CreateCheckoutDto & { workspaceId: string; userId: string },
  ): Promise<CheckoutUrl> {
    // Resolve or create the provider-side customer for this workspace
    const existingCustomer = await this.billingRepo.findCustomerByWorkspaceId(
      data.workspaceId,
    );

    const checkout = await this.provider.createCheckoutSession({
      planId: data.planId,
      variantId: data.variantId,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      ...(existingCustomer && {
        customerId: this.encryption.decrypt(
          existingCustomer.providerCustomerId,
        ),
      }),
      metadata: {
        workspace_id: data.workspaceId,
        user_id: data.userId,
      },
    });

    await this.outbox.transaction(async (tx) => {
      await this.outbox.createEvent(
        "checkout.created",
        {
          checkoutUrl: checkout.url,
          workspaceId: data.workspaceId,
          userId: data.userId,
          expiresAt: checkout.expiresAt,
        },
        tx,
      );
    });

    return checkout;
  }

  // ─── Webhook Handling ─────────────────────────────────────────────────

  /**
   * Verifies and processes an incoming webhook from Polar.
   *
   * @param payload   Raw request body (Buffer or string) for signature verification
   * @param headers   Request headers (Standard Webhooks: webhook-id, webhook-timestamp, webhook-signature)
   */
  async handleWebhook(
    payload: string | Buffer | Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<WebhookEvent> {
    let event: WebhookEvent;

    try {
      event = await this.provider.handleWebhook(payload, headers);
    } catch (err: any) {
      this.logger.error(`Webhook verification failed: ${err.message}`);
      throw new UnauthorizedException("Invalid webhook signature");
    }

    this.logger.log(
      `Received billing webhook: ${event.type} (${event.id})`,
    );

    // Idempotency check — skip if we've already processed this event
    const alreadyProcessed = await this.billingRepo.isEventProcessed(
      event.id,
    );
    if (alreadyProcessed) {
      this.logger.warn(`Skipping duplicate billing event: ${event.id} (type: ${event.type})`);
      return event;
    }

    // Dispatch to the correct handler
    try {
      await this.dispatchWebhookEvent(event);
    } catch (err: any) {
      this.logger.error(
        `Error processing event ${event.type} (${event.id}): ${err.message}`,
        err.stack,
      );
      // Re-throw only if it's a programmer error, not a data issue
      throw err;
    }

    return event;
  }

  private async dispatchWebhookEvent(event: WebhookEvent): Promise<void> {
    const eventData = event.data as Record<string, any>;

    switch (event.type) {
      case "subscription.created":
        await this.handleSubscriptionCreated(event.id, eventData);
        break;
      case "subscription.updated":
        await this.handleSubscriptionUpdated(event.id, eventData);
        break;
      case "subscription.canceled":
        await this.handleSubscriptionCanceled(event.id, eventData);
        break;
      case "customer.created":
        await this.handleCustomerCreated(event.id, eventData);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
        // Still mark as processed to prevent re-delivery loops
        await this.billingRepo.markEventProcessed({
          providerEventId: event.id,
          eventType: event.type,
        });
    }
  }

  // ─── Subscription Event Handlers ──────────────────────────────────────

  private async handleSubscriptionCreated(
    eventId: string,
    data: Record<string, any>,
  ): Promise<void> {
    const sub = this.extractSubscriptionData(data);
    if (!sub) {
      this.logger.warn(`subscription.created: could not extract subscription data`);
      return;
    }

    await this.billingRepo.transaction(async (tx) => {
      // Ensure customer record exists
      if (sub.customerId && sub.workspaceId) {
        await this.billingRepo.upsertCustomer(
          {
            workspaceId: sub.workspaceId,
            providerCustomerId: this.encryption.encrypt(sub.customerId),
          },
          tx,
        );
      }

      await this.billingRepo.upsertSubscription(
        {
          workspaceId: sub.workspaceId!,
          providerSubscriptionId: sub.subscriptionId,
          planId: sub.planId,
          variantId: sub.variantId,
          status: this.mapStatus(sub.status),
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
        },
        tx,
      );

      await this.billingRepo.markEventProcessed(
        { providerEventId: eventId, eventType: "subscription.created" },
        tx,
      );

      // Write outbox event for downstream consumers
      await this.outbox.createEvent(
        "billing.subscription.created",
        { subscriptionId: sub.subscriptionId, workspaceId: sub.workspaceId },
        tx,
      );
    });

    // Invalidate subscription cache
    if (sub.workspaceId) {
      await this.cache.del(`billing:ws:${sub.workspaceId}:subscription`);
    }

    this.eventEmitter.emit("billing.subscription.created", {
      subscriptionId: sub.subscriptionId,
      workspaceId: sub.workspaceId,
      planId: sub.planId,
    });
  }

  private async handleSubscriptionUpdated(
    eventId: string,
    data: Record<string, any>,
  ): Promise<void> {
    const sub = this.extractSubscriptionData(data);
    if (!sub) return;

    await this.billingRepo.transaction(async (tx) => {
      await this.billingRepo.upsertSubscription(
        {
          workspaceId: sub.workspaceId!,
          providerSubscriptionId: sub.subscriptionId,
          planId: sub.planId,
          variantId: sub.variantId,
          status: this.mapStatus(sub.status),
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAt: sub.cancelAt,
        },
        tx,
      );

      await this.billingRepo.markEventProcessed(
        { providerEventId: eventId, eventType: "subscription.updated" },
        tx,
      );

      await this.outbox.createEvent(
        "billing.subscription.updated",
        {
          subscriptionId: sub.subscriptionId,
          workspaceId: sub.workspaceId,
          status: sub.status,
        },
        tx,
      );
    });

    // Invalidate subscription cache
    if (sub.workspaceId) {
      await this.cache.del(`billing:ws:${sub.workspaceId}:subscription`);
    }

    this.eventEmitter.emit("billing.subscription.updated", {
      subscriptionId: sub.subscriptionId,
      workspaceId: sub.workspaceId,
      status: sub.status,
    });
  }

  private async handleSubscriptionCanceled(
    eventId: string,
    data: Record<string, any>,
  ): Promise<void> {
    const sub = this.extractSubscriptionData(data);
    if (!sub) return;

    await this.billingRepo.transaction(async (tx) => {
      await this.billingRepo.upsertSubscription(
        {
          workspaceId: sub.workspaceId!,
          providerSubscriptionId: sub.subscriptionId,
          planId: sub.planId,
          variantId: sub.variantId,
          status: "cancelled",
          endsAt: sub.cancelAt ?? sub.currentPeriodEnd ?? new Date(),
          cancelAt: sub.cancelAt ?? new Date(),
        },
        tx,
      );

      await this.billingRepo.markEventProcessed(
        { providerEventId: eventId, eventType: "subscription.canceled" },
        tx,
      );

      await this.outbox.createEvent(
        "billing.subscription.canceled",
        { subscriptionId: sub.subscriptionId, workspaceId: sub.workspaceId },
        tx,
      );
    });

    // Invalidate subscription cache
    if (sub.workspaceId) {
      await this.cache.del(`billing:ws:${sub.workspaceId}:subscription`);
    }

    this.eventEmitter.emit("billing.subscription.canceled", {
      subscriptionId: sub.subscriptionId,
      workspaceId: sub.workspaceId,
    });
  }

  private async handleCustomerCreated(
    eventId: string,
    data: Record<string, any>,
  ): Promise<void> {
    const customerId =
      data.data?.id ?? data.id;
    const workspaceId =
      data.data?.metadata?.workspace_id ??
      data.metadata?.workspace_id;

    if (!customerId || !workspaceId) {
      this.logger.warn(`customer.created: missing customerId or workspaceId`);
      await this.billingRepo.markEventProcessed({
        providerEventId: eventId,
        eventType: "customer.created",
      });
      return;
    }

    await this.billingRepo.transaction(async (tx) => {
      await this.billingRepo.upsertCustomer(
        {
          workspaceId,
          providerCustomerId: this.encryption.encrypt(customerId),
        },
        tx,
      );

      await this.billingRepo.markEventProcessed(
        { providerEventId: eventId, eventType: "customer.created" },
        tx,
      );
    });
  }

  // ─── Read Operations ──────────────────────────────────────────────────

  /**
   * Retrieves subscription for a workspace.
   * Cached for 5 minutes (invalidated on webhooks).
   */
  async getSubscription(workspaceId: string) {
    return this.cache.getOrSet(
      `billing:ws:${workspaceId}:subscription`,
      async () => {
        const sub = await this.billingRepo.findSubscriptionByWorkspaceId(workspaceId);

        if (!sub) {
          return { status: "none" as const, workspaceId };
        }

        return {
          id: sub.id,
          status: sub.status,
          planId: sub.planId,
          variantId: sub.variantId,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAt: sub.cancelAt,
          endsAt: sub.endsAt,
          workspaceId,
        };
      },
      300, // 5 min cache
    );
  }

  async portal(workspaceId: string) {
    const customer =
      await this.billingRepo.findCustomerByWorkspaceId(workspaceId);
    if (!customer) {
      return { url: null };
    }
    // Polar customer portal is at the Polar dashboard — return a direct link
    const polarDashboard = this.configService.get<string>(
      "POLAR_PORTAL_URL",
      "https://polar.sh",
    );
    return { url: `${polarDashboard}/purchases/subscriptions` };
  }

  async invoices(workspaceId: string) {
    // Polar doesn't expose invoices via API —
    // return empty list with a portal link to the billing overview
    return { invoices: [], message: "View invoices in the Polar portal" };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  private extractSubscriptionData(data: Record<string, any>) {
    // Polar wraps event data in a `data` object
    const payload = data.data ?? data;

    const subscriptionId = payload.id;
    const customerId = payload.customerId ?? payload.customer_id;
    
    // Resolve workspace_id from multiple possible locations (Polar metadata or Customer metadata)
    const workspaceId =
      payload.metadata?.workspace_id ??
      payload.customer?.metadata?.workspace_id ??
      payload.metadata?.workspaceId ??
      data.metadata?.workspace_id;

    const planId =
      payload.productId ?? payload.product_id ?? payload.planId ?? "";
    const variantId =
      payload.priceId ?? payload.price_id ?? payload.variantId ?? "";
    const status = payload.status ?? "active";

    const currentPeriodStart = payload.currentPeriodStart
      ? new Date(payload.currentPeriodStart)
      : undefined;
    const currentPeriodEnd = payload.currentPeriodEnd
      ? new Date(payload.currentPeriodEnd)
      : undefined;
    
    // If specifically canceled at period end, set cancelAt
    const cancelAt = payload.cancelAtPeriodEnd || payload.cancel_at_period_end
      ? currentPeriodEnd
      : payload.endsAt ?? payload.ends_at
        ? new Date(payload.endsAt ?? payload.ends_at)
        : undefined;

    if (!subscriptionId) {
      this.logger.error("Webhook payload missing subscription ID after extraction", { eventId: data.id });
      return null;
    }

    if (!workspaceId) {
      this.logger.error("Webhook payload missing workspace_id. Event: " + subscriptionId);
    }

    return {
      subscriptionId,
      customerId,
      workspaceId,
      planId,
      variantId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAt,
    };
  }

  private mapStatus(status: string): Subscription["status"] {
    return STATUS_MAP[status] ?? "active";
  }
}
