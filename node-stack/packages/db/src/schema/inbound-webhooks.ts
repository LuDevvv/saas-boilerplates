import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  integer,
  varchar,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────

export const inboundWebhookStatusEnum = pgEnum("inbound_webhook_status", [
  "received",
  "validated",
  "rejected",
  "processed",
  "failed",
]);

export const webhookProviderEnum = pgEnum("webhook_provider", [
  "polar",
  "clerk",
  "generic",
]);

// ─── Inbound Webhook Logs ────────────────────────────────────────────────

export const inboundWebhookLogs = pgTable(
  "inbound_webhook_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    /** Provider that sent the webhook (stripe, polar, clerk, etc.) */
    provider: webhookProviderEnum("provider").notNull(),

    /** The provider's own event ID — used as idempotency key */
    providerEventId: varchar("provider_event_id", { length: 512 }).notNull(),

    /** The event type as reported by the provider (e.g. "invoice.payment_succeeded") */
    eventType: varchar("event_type", { length: 255 }).notNull(),

    /** The raw request headers (sanitised — no auth tokens) */
    headers: jsonb("headers"),

    /** The full raw payload as received (stored for replay/debugging) */
    rawPayload: text("raw_payload"),

    /** The parsed/transformed event payload */
    parsedPayload: jsonb("parsed_payload"),

    /** Validation status */
    status: inboundWebhookStatusEnum("status").notNull().default("received"),

    /** Whether signature verification passed */
    signatureValid: boolean("signature_valid"),

    /** If validation failed or processing errored, store the reason */
    errorMessage: text("error_message"),

    /** The internal event name that was emitted (e.g. "billing.invoice.paid") */
    internalEventName: varchar("internal_event_name", { length: 255 }),

    /** Number of times we've tried processing this webhook */
    processingAttempts: integer("processing_attempts").notNull().default(0),

    /** Source IP of the request (for audit/rate limiting) */
    sourceIp: varchar("source_ip", { length: 45 }),

    /** HTTP status code we returned to the provider */
    responseStatus: integer("response_status"),

    /** Processing duration in milliseconds */
    processingDurationMs: integer("processing_duration_ms"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (table) => ({
    providerEventIdx: index("idx_inbound_wh_provider_event").on(
      table.provider,
      table.providerEventId,
    ),
    providerIdx: index("idx_inbound_wh_provider").on(table.provider),
    statusIdx: index("idx_inbound_wh_status").on(table.status),
    eventTypeIdx: index("idx_inbound_wh_event_type").on(table.eventType),
    createdAtIdx: index("idx_inbound_wh_created_at").on(table.createdAt),
  }),
);

// ─── Type Exports ────────────────────────────────────────────────────────

export type InboundWebhookLog = typeof inboundWebhookLogs.$inferSelect;
export type NewInboundWebhookLog = typeof inboundWebhookLogs.$inferInsert;
