import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";

/**
 * Audit Logs table.
 * The absolute source of truth for all critical system interactions.
 * Stores action metadata, intent, and impact for compliance and debugging.
 */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // Keep log even if user is deleted
  action: text("action").notNull(), // e.g. 'project.created', 'subscription.updated'
  entityType: text("entity_type"), // e.g. 'workspace', 'subscription'
  entityId: text("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
