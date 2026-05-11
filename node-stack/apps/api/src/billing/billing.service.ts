import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type {
  PaymentProvider,
  CheckoutUrl,
  WebhookEvent,
} from "@node-stack/billing-adapter";
import { CacheService } from "@node-stack/cache";
import {
  AuditLogRepository,
  BillingRepository,
  DB_TOKEN,
  withTenantTx,
  withSystemTx,
  schema,
  type Subscription,
  Database,
} from "@node-stack/db";
import { eq } from "drizzle-orm";
import { CreateCheckoutDto } from "@node-stack/validators";

import { EncryptionService } from "@/common/services/encryption.service.js";
import { OutboxService } from "@/common/services/outbox.service.js";

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
    private readonly auditLog: AuditLogRepository,
    private readonly encryption: EncryptionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cache: CacheService,
    @Inject("PAYMENT_PROVIDER") private readonly provider: PaymentProvider,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  // ─── Checkout ─────────────────────────────────────────────────────────

  /**
   * Resolves a semantic plan+billing combo to the actual Polar product ID.
   *
   * Supports two structures:
   *   A) 4 separate products (monthly + yearly as distinct Polar products):
   *        POLAR_PRODUCT_ID_PRO_MONTHLY / POLAR_PRODUCT_ID_PRO_YEARLY
   *        POLAR_PRODUCT_ID_ELITE_MONTHLY / POLAR_PRODUCT_ID_ELITE_YEARLY
   *   B) 2 products with multiple prices (variantId ignored, Polar shows prices):
   *        POLAR_PRODUCT_ID_PRO / POLAR_PRODUCT_ID_ELITE
   *
   * Structure A takes precedence when the period-specific vars are set.
   */
  private resolvePlanId(planId: string, variantId?: string): string {
    if (this.configService.get<string>('BILLING_PROVIDER') !== 'polar') return planId;

    const key = planId.toLowerCase();
    const period = (variantId ?? 'monthly').toLowerCase() === 'yearly' ? 'YEARLY' : 'MONTHLY';

    // Structure A — period-specific product IDs
    const periodKey = `POLAR_PRODUCT_ID_${key.toUpperCase()}_${period}`;
    const periodId = this.configService.get<string>(periodKey);
    if (periodId) return periodId;

    // Structure B — single product ID per plan (Polar shows both prices)
    const fallbackKey = `POLAR_PRODUCT_ID_${key.toUpperCase()}`;
    return this.configService.get<string>(fallbackKey) ?? planId;
  }

  async createCheckout(
    data: CreateCheckoutDto & { workspaceId: string; userId: string },
  ): Promise<CheckoutUrl> {
    const resolvedPlanId = this.resolvePlanId(data.planId, data.variantId);

    // Fetch user email + name to pre-fill Polar checkout fields
    const user = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, data.userId),
      columns: { email: true, name: true },
    });

    // customers is RLS-protected; must run inside tenant tx
    const existingCustomer = await withTenantTx(
      data.workspaceId,
      (tx) => this.billingRepo.findCustomerByWorkspaceId(data.workspaceId, tx),
      this.db,
    );

    const billingCountry = this.configService.get<string>('POLAR_DEFAULT_BILLING_COUNTRY');

    const checkout = await this.provider.createCheckoutSession({
      planId: resolvedPlanId,
      variantId: data.variantId,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      email: user?.email,
      name: user?.name ?? undefined,
      billingCountry,
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

    // Log the checkout attempt for security tracking
    await this.auditLog.create({
      workspaceId: data.workspaceId,
      userId: data.userId,
      action: "billing.checkout_created",
      entityType: "checkout",
      entityId: resolvedPlanId,
      metadata: {
        planId: data.planId,
        resolvedPlanId,
        variantId: data.variantId,
        checkoutUrl: checkout.url,
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Webhook verification failed: ${message}`);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(
        `Error processing event ${event.type} (${event.id}): ${message}`,
        stack,
      );
      // Re-throw only if it's a programmer error, not a data issue
      throw err;
    }

    return event;
  }

  private async dispatchWebhookEvent(event: WebhookEvent): Promise<void> {
    const eventData = event.data as Record<string, unknown>;

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
    data: Record<string, unknown>,
  ): Promise<void> {
    const sub = this.extractSubscriptionData(data);
    if (!sub) {
      this.logger.warn(`subscription.created: could not extract subscription data`);
      return;
    }

    if (!sub.workspaceId) {
      this.logger.error(
        `subscription.created: cannot persist without workspaceId (eventId=${eventId}, subscriptionId=${sub.subscriptionId})`,
      );
      return;
    }
    await withTenantTx(sub.workspaceId, async (tx) => {
      if (sub.customerId) {
        await this.billingRepo.upsertCustomer(
          {
            workspaceId: sub.workspaceId!,
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

      // System-actor row: webhook events have no human actor.
      await this.auditLog.create(
        {
          workspaceId: sub.workspaceId,
          userId: null,
          action: "billing.subscription_created",
          entityType: "subscription",
          entityId: sub.subscriptionId,
          metadata: {
            providerSubscriptionId: sub.subscriptionId,
            planId: sub.planId,
            variantId: sub.variantId,
            status: this.mapStatus(sub.status),
          },
        },
        tx,
      );
    }, this.db);

    // Invalidate subscription cache
    if (sub.workspaceId) {
      await this.cache.del(`billing:ws:${sub.workspaceId}:subscription`);
    }

    // Mark onboarding as complete — user has now paid and set up a workspace
    if (sub.userId) {
      try {
        await withSystemTx(async (tx) => {
          await tx
            .update(schema.users)
            .set({ onboardingStatus: "completed" })
            .where(eq(schema.users.id, sub.userId!));
        }, this.db);
        this.logger.log(`Onboarding completed for user ${sub.userId}`);
      } catch (err) {
        this.logger.warn(`Could not mark onboarding complete for user ${sub.userId}: ${(err as Error).message}`);
      }
    }

    this.eventEmitter.emit("billing.subscription.created", {
      subscriptionId: sub.subscriptionId,
      workspaceId: sub.workspaceId,
      planId: sub.planId,
    });
  }

  private async handleSubscriptionUpdated(
    eventId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const sub = this.extractSubscriptionData(data);
    if (!sub) return;
    if (!sub.workspaceId) {
      this.logger.error(
        `subscription.updated: cannot persist without workspaceId (eventId=${eventId})`,
      );
      return;
    }

    await withTenantTx(sub.workspaceId, async (tx) => {
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

      await this.auditLog.create(
        {
          workspaceId: sub.workspaceId,
          userId: null,
          action: "billing.subscription_updated",
          entityType: "subscription",
          entityId: sub.subscriptionId,
          metadata: {
            providerSubscriptionId: sub.subscriptionId,
            newStatus: this.mapStatus(sub.status),
            cancelAt: sub.cancelAt?.toISOString() ?? null,
          },
        },
        tx,
      );
    }, this.db);

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
    data: Record<string, unknown>,
  ): Promise<void> {
    const sub = this.extractSubscriptionData(data);
    if (!sub) return;
    if (!sub.workspaceId) {
      this.logger.error(
        `subscription.canceled: cannot persist without workspaceId (eventId=${eventId})`,
      );
      return;
    }

    await withTenantTx(sub.workspaceId, async (tx) => {
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

      await this.auditLog.create(
        {
          workspaceId: sub.workspaceId,
          userId: null,
          action: "billing.subscription_canceled",
          entityType: "subscription",
          entityId: sub.subscriptionId,
          metadata: {
            providerSubscriptionId: sub.subscriptionId,
            canceledAt: (sub.cancelAt ?? new Date()).toISOString(),
            endsAt: (sub.cancelAt ?? sub.currentPeriodEnd ?? new Date()).toISOString(),
          },
        },
        tx,
      );
    }, this.db);

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
    data: Record<string, unknown>,
  ): Promise<void> {
    const inner = data.data as Record<string, unknown> | undefined;
    const innerMeta = inner?.metadata as Record<string, unknown> | undefined;
    const outerMeta = data.metadata as Record<string, unknown> | undefined;
    const customerId =
      (typeof inner?.id === "string" ? inner.id : undefined) ??
      (typeof data.id === "string" ? data.id : undefined);
    const workspaceId =
      (typeof innerMeta?.workspace_id === "string" ? innerMeta.workspace_id : undefined) ??
      (typeof outerMeta?.workspace_id === "string" ? outerMeta.workspace_id : undefined);

    if (!customerId || !workspaceId) {
      this.logger.warn(`customer.created: missing customerId or workspaceId`);
      await this.billingRepo.markEventProcessed({
        providerEventId: eventId,
        eventType: "customer.created",
      });
      return;
    }

    await withTenantTx(workspaceId, async (tx) => {
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
    }, this.db);
  }

  // ─── Read Operations ──────────────────────────────────────────────────

  /**
   * Retrieves subscription for a workspace.
   * Cached for 5 minutes (invalidated on webhooks).
   */
  async getSubscription(workspaceId: string): Promise<Record<string, unknown>> {
    return this.cache.getOrSet(
      `billing:ws:${workspaceId}:subscription`,
      async () => {
        const sub = await withTenantTx(
          workspaceId,
          (tx) => this.billingRepo.findSubscriptionByWorkspaceId(workspaceId, tx),
          this.db,
        );

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

  async portal(workspaceId: string): Promise<{ url: string | null }> {
    const customer = await withTenantTx(
      workspaceId,
      (tx) => this.billingRepo.findCustomerByWorkspaceId(workspaceId, tx),
      this.db,
    );
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

  async invoices(_workspaceId: string): Promise<never[]> {
    // Polar doesn't expose invoices via API — return empty list.
    // Use the portal for history.
    return [];
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  private extractSubscriptionData(data: Record<string, unknown>): {
    subscriptionId: string;
    customerId: string | undefined;
    workspaceId: string | undefined;
    userId: string | undefined;
    planId: string;
    variantId: string;
    status: string;
    currentPeriodStart: Date | undefined;
    currentPeriodEnd: Date | undefined;
    cancelAt: Date | undefined;
  } | null {
    // Polar wraps event data in a `data` object
    const raw = (data.data ?? data) as Record<string, unknown>;
    const meta = raw.metadata as Record<string, unknown> | undefined;
    const customer = raw.customer as Record<string, unknown> | undefined;
    const customerMeta = customer?.metadata as Record<string, unknown> | undefined;
    const dataMeta = data.metadata as Record<string, unknown> | undefined;

    const subscriptionId = typeof raw.id === "string" ? raw.id : undefined;
    const customerId =
      typeof raw.customerId === "string" ? raw.customerId :
      typeof raw.customer_id === "string" ? raw.customer_id :
      undefined;

    // Resolve workspace_id from multiple possible locations (Polar metadata or Customer metadata)
    const workspaceId =
      (typeof meta?.workspace_id === "string" ? meta.workspace_id : undefined) ??
      (typeof customerMeta?.workspace_id === "string" ? customerMeta.workspace_id : undefined) ??
      (typeof meta?.workspaceId === "string" ? meta.workspaceId : undefined) ??
      (typeof dataMeta?.workspace_id === "string" ? dataMeta.workspace_id : undefined);

    const userId =
      (typeof meta?.user_id === "string" ? meta.user_id : undefined) ??
      (typeof customerMeta?.user_id === "string" ? customerMeta.user_id : undefined) ??
      (typeof dataMeta?.user_id === "string" ? dataMeta.user_id : undefined);

    const planId =
      typeof raw.productId === "string" ? raw.productId :
      typeof raw.product_id === "string" ? raw.product_id :
      typeof raw.planId === "string" ? raw.planId :
      "";
    const variantId =
      typeof raw.priceId === "string" ? raw.priceId :
      typeof raw.price_id === "string" ? raw.price_id :
      typeof raw.variantId === "string" ? raw.variantId :
      "";
    const status = typeof raw.status === "string" ? raw.status : "active";

    const currentPeriodStart = raw.currentPeriodStart
      ? new Date(raw.currentPeriodStart as string)
      : undefined;
    const currentPeriodEnd = raw.currentPeriodEnd
      ? new Date(raw.currentPeriodEnd as string)
      : undefined;

    // If specifically canceled at period end, set cancelAt
    const cancelAt = raw.cancelAtPeriodEnd || raw.cancel_at_period_end
      ? currentPeriodEnd
      : raw.endsAt ?? raw.ends_at
        ? new Date((raw.endsAt ?? raw.ends_at) as string)
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
      userId,
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
