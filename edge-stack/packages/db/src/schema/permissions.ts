import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { workspaceRoleEnum } from "./workspaces";

/**
 * Permissions table.
 * Defines granular capabilities within the system (e.g., 'workspace:invite', 'billing:view').
 * Project-agnostic and fully extensible.
 */
export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(), // e.g. 'workspace:write'
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Role Permissions bridge.
 * Maps workspace roles (Owner, Admin, Member) to specific granular permissions.
 */
export const rolePermissions = pgTable(
  "role_permissions",
  {
    role: workspaceRoleEnum("role").notNull(),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.role, t.permissionId] }),
  }),
);

export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
