# Database Layer Documentation

## 1. Drizzle ORM Overview

This boilerplate uses **Drizzle ORM** with a SQL-first approach, providing:

- Full type safety with PostgreSQL
- ACID transaction support
- Lightweight footprint
- Migration-first design

---

## 2. Schema Architecture

### 2.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐         ┌──────────────┐         ┌─────────────┐          │
│   │   User   │────────►│  Membership  │◄────────│  Workspace  │          │
│   │          │    1:N  │              │    N:1  │             │          │
│   └──────────┘         └──────────────┘         └─────────────┘          │
│        │                        │                       │                 │
│        │                        │                       │                 │
│        │ 1:1                   │ 1:N                   │ 1:N            │
│        ▼                        ▼                       ▼                 │
│   ┌──────────┐         ┌──────────────┐         ┌─────────────┐          │
│   │ Session  │         │Invitation   │         │ Subscription│          │
│   │          │         │              │         │             │          │
│   └──────────┘         └──────────────┘         └─────────────┘          │
│        │                                                    │                 │
│        │ 1:N                                               │ 1:1            │
│        ▼                                                    ▼                 │
│   ┌──────────┐                                       ┌─────────────┐       │
│   │ Account  │                                       │  Customer   │       │
│   │ (OAuth)  │                                       │             │       │
│   └──────────┘                                       └─────────────┘       │
│        │
│        │ 1:N
│        ▼
│   ┌──────────┐
│   │Verification│
│   │  Token   │
│   └──────────┘
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                      Standalone Tables                             │    │
│   │                                                                    │    │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐       │    │
│   │  │ AuditLog │  │ UsageMetric│ │   Task   │  │  OutboxEvent│       │    │
│   │  │          │  │            │  │          │  │             │       │    │
│   │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘       │    │
│   └──────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Schema Definitions

### 3.1 Users Schema

```typescript
// packages/db/src/schema/users.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "super_admin",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("user"),
  emailVerified: boolean("email_verified").notNull().default(false),

  // 2FA
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorRecoveryCodes: jsonb("two_factor_recovery_codes").$type<string[]>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### 3.2 Workspaces Schema

```typescript
// packages/db/src/schema/workspaces.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "member",
]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
});

export const memberships = pgTable(
  "memberships",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    role: workspaceRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.workspaceId] }),
  }),
);

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
```

### 3.3 Auth Schema

```typescript
// packages/db/src/schema/auth.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: text("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type Account = typeof accounts.$inferSelect;
```

### 3.4 Billing Schema

```typescript
// packages/db/src/schema/billing.ts
import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialling",
  "past_due",
  "cancelled",
  "unpaid",
  "paused",
]);

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  providerCustomerId: text("provider_customer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  providerSubscriptionId: text("provider_subscription_id").notNull().unique(),
  planId: text("plan_id").notNull(),
  variantId: text("variant_id").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  nextPaymentAt: timestamp("next_payment_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
```

### 3.5 Audit Schema

```typescript
// packages/db/src/schema/audit.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceCreatedAtIdx: index("audit_logs_workspace_id_created_at_idx").on(
      table.workspaceId,
      table.createdAt,
    ),
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
  }),
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
```

### 3.6 Outbox Schema

```typescript
// packages/db/src/schema/outbox.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const outbox = pgTable(
  "outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").notNull().default(false),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    processedCreatedAtIdx: index("outbox_processed_created_at_idx").on(
      table.processed,
      table.createdAt,
    ),
    eventTypeIdx: index("outbox_event_type_idx").on(table.eventType),
  }),
);

export type OutboxEvent = typeof outbox.$inferSelect;
export type NewOutboxEvent = typeof outbox.$inferInsert;
```

---

## 4. Database Client

### 4.1 Client Factory

```typescript
// packages/db/src/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;

// Transaction helper
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>,
): Promise<T> {
  return await db.transaction(async (tx) => {
    try {
      return await callback(tx);
    } catch (error) {
      tx.rollback();
      throw error;
    }
  });
}
```

### 4.2 Repository Pattern

```typescript
// packages/db/src/repositories/user.repository.ts
import { eq } from "drizzle-orm";
import { db, type Database } from "../index";
import { users, type User, type NewUser } from "../schema/users";

export const UserRepository = {
  async findById(db: Database, id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async findByEmail(db: Database, email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  },

  async create(db: Database, data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async update(
    db: Database,
    id: string,
    data: Partial<NewUser>,
  ): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user ?? null;
  },

  async delete(db: Database, id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  },
};
```

---

## 5. Transactions

### 5.1 Basic Transaction

```typescript
// Example: User registration with transaction
async function registerUser(data: RegisterInput) {
  return await db.transaction(async (tx) => {
    // Create user
    const [user] = await tx
      .insert(users)
      .values({
        email: data.email,
        passwordHash: await hashPassword(data.password),
        name: data.name,
      })
      .returning();

    // Create session
    const [session] = await tx
      .insert(sessions)
      .values({
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .returning();

    // Create outbox event
    await tx.insert(outbox).values({
      eventType: "email.welcome",
      payload: { email: user.email, name: user.name },
    });

    return { user, session };
  });
}
```

### 5.2 Nested Transactions (Savepoints)

```typescript
// Example: Complex operation with savepoints
async function migrateWorkspaceOwnership(
  workspaceId: string,
  fromUserId: string,
  toUserId: string,
) {
  return await db.transaction(async (tx) => {
    // Outer transaction

    // Step 1: Verify current owner
    const membership = await tx
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.workspaceId, workspaceId),
          eq(memberships.userId, fromUserId),
          eq(memberships.role, "owner"),
        ),
      )
      .limit(1);

    if (!membership[0]) {
      throw new Error("User is not the owner");
    }

    // Step 2: Update old owner role (savepoint)
    await tx.savepoint("update_old_owner");
    try {
      await tx
        .update(memberships)
        .set({ role: "admin" })
        .where(
          and(
            eq(memberships.workspaceId, workspaceId),
            eq(memberships.userId, fromUserId),
          ),
        );
    } catch (error) {
      await tx.rollback("update_old_owner");
      throw error;
    }

    // Step 3: Update new owner role (savepoint)
    await tx.savepoint("update_new_owner");
    try {
      await tx
        .update(memberships)
        .set({ role: "owner" })
        .where(
          and(
            eq(memberships.workspaceId, workspaceId),
            eq(memberships.userId, toUserId),
          ),
        );
    } catch (error) {
      await tx.rollback("update_new_owner");
      throw error;
    }
  });
}
```

---

## 6. Migrations

### 6.1 Migration Structure

```
packages/db/src/migrations/
├── 001_initial.sql
├── 002_add_workspaces.sql
├── 003_add_billing.sql
├── 004_add_audit_logs.sql
└── 005_add_outbox.sql
```

### 6.2 Initial Migration Example

```sql
-- packages/db/src/migrations/001_initial.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  two_factor_recovery_codes JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Accounts table (OAuth)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state VARCHAR(100),
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Verification tokens
CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(identifier, token)
);

-- Workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_slug ON workspaces(slug);

-- Memberships table
CREATE TABLE memberships (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, workspace_id)
);

CREATE INDEX idx_memberships_workspace_id ON memberships(workspace_id);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_customer_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_provider_customer_id ON customers(provider_customer_id);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  plan_id VARCHAR(100) NOT NULL,
  variant_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  next_payment_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_workspace_id ON subscriptions(workspace_id);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_workspace_id_created_at ON audit_logs(workspace_id, created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Outbox table
CREATE TABLE outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_processed_created_at ON outbox(processed, created_at);
CREATE INDEX idx_outbox_event_type ON outbox(event_type);
```

---

## 7. Indexing Strategy

### 7.1 Index Types Used

| Index Type    | Use Case                        | Examples                                     |
| ------------- | ------------------------------- | -------------------------------------------- |
| **B-tree**    | Equality queries, range queries | `WHERE email = ?`, `WHERE status = 'active'` |
| **Hash**      | Fast equality on large tables   | Session lookups                              |
| **GIN**       | Full-text search, JSONB         | `metadata @> '{"key": "value"}'`             |
| **Composite** | Multi-column queries            | `WHERE workspace_id = ? AND created_at > ?`  |

### 7.2 Query Optimization Examples

```typescript
// Good: Use composite index
const result = await db
  .select()
  .from(auditLogs)
  .where(
    and(
      eq(auditLogs.workspaceId, workspaceId),
      gte(auditLogs.createdAt, startDate),
    ),
  );

// SQL generated:
// SELECT * FROM audit_logs
// WHERE workspace_id = $1 AND created_at >= $2
// USING INDEX audit_logs_workspace_id_created_at
```

---

## 8. Connection Pooling

### 8.1 PgBouncer Configuration

```ini
# pgbouncer.ini
[databases]
node_saas = host=postgres port=5432 dbname=node_saas

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
```

### 8.2 Application Configuration

```typescript
// packages/db/src/index.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Connections per instance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 9. Backup & Recovery

### 9.1 Backup Strategy

| Backup Type       | Frequency  | Retention |
| ----------------- | ---------- | --------- |
| **Full Dump**     | Daily      | 30 days   |
| **WAL Archiving** | Continuous | 7 days    |
| **Point-in-Time** | Hourly     | 7 days    |

### 9.2 Recovery Commands

```bash
# Restore from full dump
pg_restore -h postgres -U postgres -d node_saas backup.dump

# Point-in-time recovery
pg_restore -h postgres -U postgres -d node_saas --target-time="2024-01-15 10:00:00" backup.dump
```
