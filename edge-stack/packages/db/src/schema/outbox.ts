import { pgTable, text, timestamp, uuid, jsonb, boolean } from "drizzle-orm/pg-core";

/**
 * Transactional Outbox table for reliable event processing.
 * Events are written to this table within the same transaction as the core data changes.
 * A background process then ensures these events are successfully dispatched (e.g., to a Queue).
 */
export const outbox = pgTable("outbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: text("event_type").notNull(), // e.g., 'email.welcome', 'email.verification'
  payload: jsonb("payload").notNull(),
  processed: boolean("processed").notNull().default(false),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OutboxEvent = typeof outbox.$inferSelect;
export type NewOutboxEvent = typeof outbox.$inferInsert;
