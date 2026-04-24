import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { workspaces } from "./workspaces.js";
import { users } from "./users.js";

/**
 * {ModuleName} status enum
 */
export const {!!moduleNameCamel}StatusEnum = pgEnum("{!!moduleName}_status", [
  "pending",
  "active",
  "inactive",
  "deleted",
]);

/**
 * {ModuleNamePlural} table - {!!moduleDescription}
 */
export const {!!moduleNamePlural} = pgTable(
  "{!!moduleNamePlural}",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    status: {!!moduleNameCamel}StatusEnum("status").notNull().default("pending"),
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
    workspaceIdx: index("idx_{!!moduleName}_workspace").on(table.workspaceId),
    statusIdx: index("idx_{!!moduleName}_status").on(table.status),
    createdByIdx: index("idx_{!!moduleName}_created_by").on(table.createdBy),
    workspaceStatusIdx: index("idx_{!!moduleName}_workspace_status").on(
      table.workspaceId,
      table.status
    ),
  }),
);

// Type exports
export type {!!ModuleName} = typeof {!!moduleNamePlural}.$inferSelect;
export type New{!!ModuleName} = typeof {!!moduleNamePlural}.$inferInsert;
