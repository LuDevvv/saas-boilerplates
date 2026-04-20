import { Injectable, Inject } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { DB_TOKEN } from "../tokens";

type Db = NodePgDatabase<typeof schema>;

@Injectable()
export class BillingRepository {
  constructor(@Inject(DB_TOKEN) private readonly db: Db) {}

  // ─── Customer Operations ─────────────────────────────────────────────

  /**
   * Upsert a customer record for a workspace.
   * If a customer already exists for the workspace, update the provider ID.
   */
  async upsertCustomer(
    data: {
      workspaceId: string;
      providerCustomerId: string;
      provider?: "polar" | "mock";
    },
    tx?: Db,
  ): Promise<schema.Customer> {
    const database = tx ?? this.db;

    const existing = await database.query.customers.findFirst({
      where: eq(schema.customers.workspaceId, data.workspaceId),
    });

    if (existing) {
      const [updated] = await database
        .update(schema.customers)
        .set({
          providerCustomerId: data.providerCustomerId,
          provider: data.provider ?? "polar",
          updatedAt: new Date(),
        })
        .where(eq(schema.customers.id, existing.id))
        .returning();
      return updated!;
    }

    const [created] = await database
      .insert(schema.customers)
      .values({
        workspaceId: data.workspaceId,
        providerCustomerId: data.providerCustomerId,
        provider: data.provider ?? "polar",
      })
      .returning();
    return created!;
  }

  async findCustomerByWorkspaceId(
    workspaceId: string,
    tx?: Db,
  ): Promise<schema.Customer | null> {
    const database = tx ?? this.db;
    const result = await database.query.customers.findFirst({
      where: eq(schema.customers.workspaceId, workspaceId),
    });
    return result ?? null;
  }

  async findCustomerByProviderId(
    providerCustomerId: string,
    tx?: Db,
  ): Promise<schema.Customer | null> {
    const database = tx ?? this.db;
    const result = await database.query.customers.findFirst({
      where: eq(schema.customers.providerCustomerId, providerCustomerId),
    });
    return result ?? null;
  }

  // ─── Subscription Operations ──────────────────────────────────────────

  /**
   * Upsert a subscription by its provider-side subscription ID.
   * Uses a full atomic upsert to handle both creation and updates from webhooks.
   */
  async upsertSubscription(
    data: {
      workspaceId: string;
      providerSubscriptionId: string;
      planId: string;
      variantId?: string;
      status: schema.Subscription["status"];
      currentPeriodStart?: Date | null;
      currentPeriodEnd?: Date | null;
      cancelAt?: Date | null;
      endsAt?: Date | null;
    },
    tx?: Db,
  ): Promise<schema.Subscription> {
    const database = tx ?? this.db;

    const existing = await database.query.subscriptions.findFirst({
      where: eq(
        schema.subscriptions.providerSubscriptionId,
        data.providerSubscriptionId,
      ),
    });

    if (existing) {
      const [updated] = await database
        .update(schema.subscriptions)
        .set({
          planId: data.planId,
          variantId: data.variantId ?? existing.variantId,
          status: data.status,
          currentPeriodStart: data.currentPeriodStart ?? existing.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd ?? existing.currentPeriodEnd,
          cancelAt: data.cancelAt,
          endsAt: data.endsAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.subscriptions.id, existing.id))
        .returning();
      return updated!;
    }

    const [created] = await database
      .insert(schema.subscriptions)
      .values({
        workspaceId: data.workspaceId,
        providerSubscriptionId: data.providerSubscriptionId,
        planId: data.planId,
        variantId: data.variantId ?? "",
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAt: data.cancelAt,
        endsAt: data.endsAt,
      })
      .returning();
    return created!;
  }

  async findSubscriptionByWorkspaceId(
    workspaceId: string,
    tx?: Db,
  ): Promise<schema.Subscription | null> {
    const database = tx ?? this.db;
    const result = await database.query.subscriptions.findFirst({
      where: eq(schema.subscriptions.workspaceId, workspaceId),
    });
    return result ?? null;
  }

  async findSubscriptionByProviderId(
    providerSubscriptionId: string,
    tx?: Db,
  ): Promise<schema.Subscription | null> {
    const database = tx ?? this.db;
    const result = await database.query.subscriptions.findFirst({
      where: eq(
        schema.subscriptions.providerSubscriptionId,
        providerSubscriptionId,
      ),
    });
    return result ?? null;
  }

  // ─── Billing Event Idempotency ────────────────────────────────────────

  /**
   * Checks if a webhook event has already been processed.
   * Uses providerEventId as a globally unique idempotency key.
   */
  async isEventProcessed(
    providerEventId: string,
    tx?: Db,
  ): Promise<boolean> {
    const database = tx ?? this.db;
    const result = await database.query.billingEvents.findFirst({
      where: and(
        eq(schema.billingEvents.providerEventId, providerEventId),
        eq(schema.billingEvents.processed, true),
      ),
    });
    return !!result;
  }

  /**
   * Marks an event as processed. MUST be called inside the same transaction
   * that performs the business logic (subscription upsert, etc.).
   */
  async markEventProcessed(
    data: { providerEventId: string; eventType: string },
    tx?: Db,
  ): Promise<void> {
    const database = tx ?? this.db;
    await database
      .insert(schema.billingEvents)
      .values({
        providerEventId: data.providerEventId,
        eventType: data.eventType,
        processed: true,
        processedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.billingEvents.providerEventId,
        set: {
          processed: true,
          processedAt: new Date(),
        },
      });
  }

  // ─── Transactions ─────────────────────────────────────────────────────

  async transaction<T>(callback: (tx: Db) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      return callback(tx as unknown as Db);
    });
  }
}
