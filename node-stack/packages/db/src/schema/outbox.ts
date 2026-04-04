import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

export const outbox = pgTable(
  "outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").notNull().default(false),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    retryCount: integer("retry_count").notNull().default(0),
    lastError: text("last_error"),
  },
  (table) => ({
    processedCreatedAtIdx: index("idx_outbox_processed_created_at").on(
      table.processed,
      table.createdAt,
    ),
    eventTypeIdx: index("idx_outbox_event_type").on(table.eventType),
    retryIdx: index("idx_outbox_retry").on(table.processed, table.retryCount),
    workspaceIdx: index("idx_outbox_workspace_id").on(table.workspaceId),
  }),
);

export type OutboxEvent = typeof outbox.$inferSelect;
export type NewOutboxEvent = typeof outbox.$inferInsert;
