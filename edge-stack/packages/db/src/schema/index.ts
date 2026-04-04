import { relations } from "drizzle-orm";
import { users } from "./users";
import { sessions, verificationTokens } from "./auth";
import { accounts } from "./accounts";
import { workspaces, memberships } from "./workspaces";
import { invitations } from "./invitations";
import { customers, subscriptions } from "./billing";
import { usageMetrics } from "./usage";
import { permissions, rolePermissions } from "./permissions";
import { auditLogs } from "./audit";
import { tasks } from "./tasks";
import { outbox } from "./outbox";

/**
 * Define Drizzle relations for easier querying and type-safety.
 */

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  tokens: many(verificationTokens),
  memberships: many(memberships),
  auditLogs: many(auditLogs),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const verificationTokensRelations = relations(
  verificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  }),
);

export const workspacesRelations = relations(workspaces, ({ many, one }) => ({
  memberships: many(memberships),
  customer: one(customers, {
    fields: [workspaces.id],
    references: [customers.workspaceId],
  }),
  subscriptions: many(subscriptions),
  usageMetrics: many(usageMetrics),
  auditLogs: many(auditLogs),
  invitations: many(invitations),
  tasks: many(tasks),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [memberships.workspaceId],
    references: [workspaces.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [invitations.workspaceId],
    references: [workspaces.id],
  }),
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [customers.workspaceId],
    references: [workspaces.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [subscriptions.workspaceId],
    references: [workspaces.id],
  }),
}));

export const usageMetricsRelations = relations(usageMetrics, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [usageMetrics.workspaceId],
    references: [workspaces.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [auditLogs.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [tasks.workspaceId],
    references: [workspaces.id],
  }),
}));

export * from "./users";
export * from "./auth";
export * from "./accounts";
export * from "./workspaces";
export * from "./billing";
export * from "./usage";
export * from "./permissions";
export * from "./audit";
export * from "./invitations";
export * from "./tasks";
export * from "./outbox";
