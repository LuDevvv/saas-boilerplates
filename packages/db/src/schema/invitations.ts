import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { workspaces, workspaceRoleEnum } from "./workspaces";
import { users } from "./users";

/**
 * Invitations table.
 * Holds pending invitations to workspaces.
 */
export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: workspaceRoleEnum("role").notNull().default("member"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
