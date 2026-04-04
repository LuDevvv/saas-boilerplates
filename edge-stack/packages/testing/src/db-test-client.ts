import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const testUsers = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  twoFactorRecoveryCodes: text("two_factor_recovery_codes"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const testWorkspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const testMemberships = sqliteTable("memberships", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => testUsers.id),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => testWorkspaces.id),
  role: text("role").notNull().default("member"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const testAccounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => testUsers.id),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const testSessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => testUsers.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const testVerificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: text("expires").notNull(),
});

export const testInvitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => testWorkspaces.id),
  role: text("role").notNull().default("member"),
  token: text("token").notNull().unique(),
  invitedBy: text("invited_by")
    .notNull()
    .references(() => testUsers.id),
  status: text("status").notNull().default("pending"),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const testCustomers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .unique()
    .references(() => testWorkspaces.id),
  providerCustomerId: text("provider_customer_id").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const testSubscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => testWorkspaces.id),
  providerSubscriptionId: text("provider_subscription_id").notNull().unique(),
  planId: text("plan_id").notNull(),
  variantId: text("variant_id").notNull(),
  status: text("status").notNull().default("active"),
  nextPaymentAt: text("next_payment_at"),
  endsAt: text("ends_at"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const testUsageMetrics = sqliteTable(
  "usage_metrics",
  {
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => testWorkspaces.id),
    metricName: text("metric_name").notNull(),
    currentUsage: integer("current_usage").notNull().default(0),
    quotaLimit: integer("quota_limit").notNull(),
    resetAt: text("reset_at").notNull(),
    updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.workspaceId, t.metricName] }),
  }),
);

export const testPermissions = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const testRolePermissions = sqliteTable("role_permissions", {
  id: text("id").primaryKey(),
  role: text("role").notNull(),
  permissionId: text("permission_id")
    .notNull()
    .references(() => testPermissions.id),
});

export const testAuditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => testWorkspaces.id),
  userId: text("user_id").references(() => testUsers.id),
  action: text("action").notNull(),
  metadata: text("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const testTasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => testWorkspaces.id),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const testSchema = {
  users: testUsers,
  workspaces: testWorkspaces,
  memberships: testMemberships,
  accounts: testAccounts,
  sessions: testSessions,
  verificationTokens: testVerificationTokens,
  invitations: testInvitations,
  customers: testCustomers,
  subscriptions: testSubscriptions,
  usageMetrics: testUsageMetrics,
  permissions: testPermissions,
  rolePermissions: testRolePermissions,
  auditLogs: testAuditLogs,
  tasks: testTasks,
};

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqliteInstance: Database.Database | null = null;

export const createTestDb = () => {
  if (dbInstance && sqliteInstance) {
    resetTestDb();
    return dbInstance;
  }

  sqliteInstance = new Database(":memory:");
  sqliteInstance.pragma("journal_mode = WAL");

  const schemaSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT,
            name TEXT,
            avatar_url TEXT,
            role TEXT NOT NULL DEFAULT 'user',
            email_verified INTEGER NOT NULL DEFAULT 0,
            two_factor_secret TEXT,
            two_factor_enabled INTEGER NOT NULL DEFAULT 0,
            two_factor_recovery_codes TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            logo_url TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS memberships (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            workspace_id TEXT NOT NULL REFERENCES workspaces(id),
            role TEXT NOT NULL DEFAULT 'member',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            provider TEXT NOT NULL,
            provider_account_id TEXT NOT NULL,
            refresh_token TEXT,
            access_token TEXT,
            expires_at INTEGER,
            token_type TEXT,
            scope TEXT,
            id_token TEXT,
            session_state TEXT
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            expires_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS verification_tokens (
            identifier TEXT NOT NULL,
            token TEXT NOT NULL,
            expires TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS invitations (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id),
            role TEXT NOT NULL DEFAULT 'member',
            token TEXT NOT NULL UNIQUE,
            invited_by TEXT NOT NULL REFERENCES users(id),
            status TEXT NOT NULL DEFAULT 'pending',
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL UNIQUE REFERENCES workspaces(id),
            provider_customer_id TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id),
            provider_subscription_id TEXT NOT NULL UNIQUE,
            plan_id TEXT NOT NULL,
            variant_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            next_payment_at TEXT,
            ends_at TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS usage_metrics (
            workspace_id TEXT NOT NULL REFERENCES workspaces(id),
            metric_name TEXT NOT NULL,
            current_usage INTEGER NOT NULL DEFAULT 0,
            quota_limit INTEGER NOT NULL,
            reset_at TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            PRIMARY KEY (workspace_id, metric_name)
        );

        CREATE TABLE IF NOT EXISTS permissions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS role_permissions (
            id TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            permission_id TEXT NOT NULL REFERENCES permissions(id)
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id),
            user_id TEXT REFERENCES users(id),
            action TEXT NOT NULL,
            metadata TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id),
            title TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `;

  sqliteInstance.exec(schemaSQL);
  dbInstance = drizzle(sqliteInstance, { schema: testSchema });

  return dbInstance;
};

export const resetTestDb = () => {
  if (!sqliteInstance) return;

  const tables = [
    "tasks",
    "audit_logs",
    "role_permissions",
    "permissions",
    "usage_metrics",
    "subscriptions",
    "customers",
    "invitations",
    "verification_tokens",
    "sessions",
    "accounts",
    "memberships",
    "workspaces",
    "users",
  ];

  for (const table of tables) {
    sqliteInstance.exec(`DELETE FROM ${table}`);
  }
};

export const closeTestDb = () => {
  if (sqliteInstance) {
    sqliteInstance.close();
    sqliteInstance = null;
    dbInstance = null;
  }
};

export type TestDb = ReturnType<typeof createTestDb>;
