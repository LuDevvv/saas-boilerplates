import { eq, and, or, sql } from "drizzle-orm";
import type { Database } from "../db";
import {
  subscriptions,
  customers,
  type Subscription,
  type NewSubscription,
  type Customer,
  type NewCustomer,
} from "../schema/billing";

/**
 * Repository for handling billing and subscription persistence.
 */
export const SubscriptionRepository = {
  /**
   * Upserts a subscription record.
   * Updates status, plan, and timing details based on the provider's subscription ID.
   */
  async upsertSubscription(
    db: Database,
    data: NewSubscription,
  ): Promise<Subscription> {
    const [result] = await db
      .insert(subscriptions)
      .values(data)
      .onConflictDoUpdate({
        target: subscriptions.providerSubscriptionId,
        set: {
          planId: data.planId,
          variantId: data.variantId,
          status: data.status,
          nextPaymentAt: data.nextPaymentAt
            ? new Date(data.nextPaymentAt)
            : null,
          endsAt: data.endsAt ? new Date(data.endsAt) : null,
          updatedAt: sql`now()`,
        },
      })
      .returning();

    if (!result) throw new Error("Failed to upsert subscription");
    return result;
  },

  /**
   * Retrieves the primary valid subscription for a workspace.
   * Considers both 'active' and 'trialling' statuses as valid.
   */
  async getActiveSubscription(
    db: Database,
    workspaceId: string,
  ): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.workspaceId, workspaceId),
          or(
            eq(subscriptions.status, "active"),
            eq(subscriptions.status, "trialling"),
          ),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  },

  async getSubscriptionByWorkspace(
    db: Database,
    workspaceId: string,
  ): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.workspaceId, workspaceId));
  },

  /**
   * Retrieves a subscription by its provider-specific ID.
   */
  async getSubscriptionByProviderId(
    db: Database,
    providerSubscriptionId: string,
  ): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.providerSubscriptionId, providerSubscriptionId))
      .limit(1);

    return result[0] ?? null;
  },

  /**
   * Upserts a customer mapping for a workspace.
   */
  async upsertCustomer(db: Database, data: NewCustomer): Promise<Customer> {
    const [result] = await db
      .insert(customers)
      .values(data)
      .onConflictDoUpdate({
        target: customers.workspaceId,
        set: {
          providerCustomerId: data.providerCustomerId,
        },
      })
      .returning();

    if (!result) throw new Error("Failed to upsert customer");
    return result;
  },

  /**
   * Retrieves the customer mapping for a workspace.
   * Used to look up the provider-specific customer ID for portal URLs.
   */
  async getCustomerByWorkspace(
    db: Database,
    workspaceId: string,
  ): Promise<Customer | null> {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.workspaceId, workspaceId))
      .limit(1);

    return result[0] ?? null;
  },
};
