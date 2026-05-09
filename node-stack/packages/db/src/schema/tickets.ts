import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { workspaces } from "./workspaces.js";

/**
 * {ModuleName} status enum
 */
export const ticketStatusEnum = pgEnum("ticket_status", [
  "pending",
  "active",
  "inactive",
  "deleted",
]);

/**
 * {ModuleNamePlural} table - Ticketing system for support
 */
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    status: ticketStatusEnum("status").notNull().default("pending"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`now()`),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    workspaceIdx: index("idx_ticket_workspace").on(table.workspaceId),
    statusIdx: index("idx_ticket_status").on(table.status),
    createdByIdx: index("idx_ticket_created_by").on(table.createdBy),
    workspaceStatusIdx: index("idx_ticket_workspace_status").on(
      table.workspaceId,
      table.status
    ),
  }),
);

// Type exports
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
