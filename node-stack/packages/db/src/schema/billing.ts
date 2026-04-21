import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  index,
  boolean,
} from "drizzle-orm/pg-core";

import { workspaces } from "./workspaces.js";

// ─── Enums ───────────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialling",
  "past_due",
  "cancelled",
  "unpaid",
  "paused",
]);

export const billingProviderEnum = pgEnum("billing_provider", [
  "polar",
  "mock",
]);

// ─── Customers ───────────────────────────────────────────────────────────

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .unique()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    /** Encrypted at rest via EncryptionService (AES-256-GCM) */
    providerCustomerId: text("provider_customer_id").notNull(),
    provider: billingProviderEnum("provider").notNull().default("polar"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    providerCustomerIdIdx: index("idx_customers_provider_customer_id").on(
      table.providerCustomerId,
    ),
  }),
);

// ─── Subscriptions ───────────────────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    providerSubscriptionId: text("provider_subscription_id").notNull().unique(),
    planId: text("plan_id").notNull(),
    variantId: text("variant_id").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    nextPaymentAt: timestamp("next_payment_at"),
    cancelAt: timestamp("cancel_at"),
    endsAt: timestamp("ends_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdIdx: index("idx_subscriptions_workspace_id").on(
      table.workspaceId,
    ),
    statusIdx: index("idx_subscriptions_status").on(table.status),
  }),
);

// ─── Billing Events (Webhook Idempotency) ────────────────────────────────

export const billingEvents = pgTable(
  "billing_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Polar webhook event ID — used as idempotency key */
    providerEventId: text("provider_event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    processed: boolean("processed").notNull().default(false),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    providerEventIdIdx: index("idx_billing_events_provider_event_id").on(
      table.providerEventId,
    ),
    processedIdx: index("idx_billing_events_processed").on(table.processed),
  }),
);

// ─── Type Exports ────────────────────────────────────────────────────────

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type BillingEvent = typeof billingEvents.$inferSelect;
export type NewBillingEvent = typeof billingEvents.$inferInsert;
