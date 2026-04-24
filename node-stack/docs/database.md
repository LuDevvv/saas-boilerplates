# Database Layer Documentation

## 1. Drizzle ORM Overview

This boilerplate uses **Drizzle ORM** with a SQL-first approach, providing:

- Full type safety with PostgreSQL.
- ACID transaction support with native RLS integration.
- Performance optimization via Prepared Statements.
- **Transactional Consistency**: Wrapped in a `withTransaction` helper that automatically propagates the tenant context to the database session.

---

## 2. Schema Architecture

### 2.1 Multi-Tenant Isolation (RLS)
The database is designed with **Row-Level Security** in mind. Every table containing tenant data (e.g., `workspaces`, `memberships`, `tasks`, `files`, `subscriptions`) should have a `workspace_id` column.

The `withTransaction` helper executes:
```sql
SET LOCAL app.current_workspace_id = 'uuid';
```
PostgreSQL policies then ensure that even if a query is missing a `WHERE` clause, it cannot access data from other tenants.

---

## 3. Core Schema Definitions

### 3.1 Identity & Workspaces
- **`users`**: Central account registry. Includes 2FA secrets and recovery codes.
- **`workspaces`**: Tenant containers identified by name and unique slug.
- **`memberships`**: M:N relationship between users and workspaces, defining roles (`owner`, `admin`, `member`, `guest`) and status.
- **`api_keys`**: Programmatic access tokens scoped to workspaces with optional expiration.

### 3.2 Billing (Polar.sh)
- **`customers`**: Maps workspaces to Polar customer IDs.
- **`subscriptions`**: Tracks plan, variant, status, and period dates.
- **`billing_events`**: Idempotency log for webhooks to prevent duplicate processing.

### 3.3 Storage
- **`files`**: Metadata for assets uploaded to S3. Tracks `status` (`pending` -> `uploaded`) and ownership.

---

## 4. Repository Pattern & Data Access

We use a **Repository Pattern** to centralize complex queries and ensure consistent data access.

```typescript
// Example: WorkspaceRepository
export const WorkspaceRepository = {
  async findById(id: string) {
    return db.query.workspaces.findFirst({
      where: eq(workspaces.id, id),
      with: { members: true }
    });
  }
}
```

### 4.1 Unit of Work (Transactions)
Use `withTransaction` for any operation involving multiple tables:

```typescript
await withTransaction(async (tx) => {
  await tx.insert(users).values(...);
  await tx.insert(memberships).values(...);
});
```

---

## 5. Performance & Scaling

### 5.1 Connection Pooling
We use `node-postgres` with an optimized `Pool` configuration:
- **Max Connections**: Configurable via `DB_POOL_MAX` (defaults to 10).
- **Timeouts**: Aggressive `idleTimeoutMillis` and `connectionTimeoutMillis` to handle high-traffic bursts.
- **PgBouncer**: The stack is compatible with PgBouncer in **Transaction Mode**.

### 5.2 Indexing Strategy
- Every foreign key is indexed to prevent full table scans on joins.
- Composite indexes are used for common filters (e.g., `(workspace_id, created_at)`).
- Unique indexes on `slug` and `email` for data integrity.

---

## 6. Migrations

Migrations are managed via **drizzle-kit**.

- **Workflow**: 
  1. Modify schema in `packages/db/src/schema/*.ts`.
  2. Run `pnpm --filter @node-stack/db db:generate` to create SQL.
  3. Run `pnpm --filter @node-stack/db db:migrate` to apply.
- **Deployment**: The API container automatically runs pending migrations on startup before accepting traffic.
