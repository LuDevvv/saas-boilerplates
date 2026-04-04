import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

import { workspaces } from "./workspaces";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialling",
  "past_due",
  "cancelled",
  "unpaid",
  "paused",
]);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .unique()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    providerCustomerId: text("provider_customer_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    providerCustomerIdIdx: index("idx_customers_provider_customer_id").on(
      table.providerCustomerId,
    ),
  }),
);

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
    nextPaymentAt: timestamp("next_payment_at"),
    endsAt: timestamp("ends_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdIdx: index("idx_subscriptions_workspace_id").on(
      table.workspaceId,
    ),
  }),
);

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
