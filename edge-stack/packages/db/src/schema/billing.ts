import {
  pgTable,
  text,
  timestamp,
  uuid,
  bigint,
  pgEnum,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

/**
 * Valid subscription statuses.
 */
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialling",
  "past_due",
  "cancelled",
  "unpaid",
  "paused",
]);

/**
 * Customers table.
 * Maps a workspace to a provider-specific customer ID (e.g., LemonSqueezy Customer ID).
 */
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  providerCustomerId: text("provider_customer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Subscriptions table.
 * Tracks the financial status and plan details for each workspace.
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  providerSubscriptionId: text("provider_subscription_id").notNull().unique(),
  planId: text("plan_id").notNull(),
  variantId: text("variant_id").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  nextPaymentAt: timestamp("next_payment_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionStatus =
  | "active"
  | "trialling"
  | "past_due"
  | "cancelled"
  | "unpaid"
  | "paused";
