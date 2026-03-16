# 🗄️ Database: Drizzle ORM + Neon Serverless

We use **Drizzle ORM** with **Neon Serverless PostgreSQL** over their HTTP driver. This eliminates TCP connection overhead entirely — ideal for the stateless Cloudflare Workers runtime where each request is an isolated V8 instance.

## 1. Schema Architecture

All schemas live in `packages/db/src/schema/`. One file per domain:

| Schema File      | Tables                            | Purpose                                     |
| ---------------- | --------------------------------- | ------------------------------------------- |
| `users.ts`       | `users`                           | User accounts with email, name, avatar, 2FA |
| `auth.ts`        | `sessions`, `verification_tokens` | Sessions and email verification             |
| `accounts.ts`    | `accounts`                        | OAuth provider linkages (Google, Facebook)  |
| `workspaces.ts`  | `workspaces`, `memberships`       | Multi-tenant organizations with roles       |
| `billing.ts`     | `customers`, `subscriptions`      | Provider-agnostic billing state             |
| `usage.ts`       | `usage_metrics`                   | Quota tracking (API calls, storage, etc.)   |
| `permissions.ts` | `permissions`, `role_permissions` | RBAC permission system                      |
| `audit.ts`       | `audit_logs`                      | Activity tracking per workspace             |
| `invitations.ts` | `invitations`                     | Workspace invite management                 |
| `tasks.ts`       | `tasks`                           | Example CRUD module for boilerplate         |
| `index.ts`       | —                                 | Relations + re-exports                      |

### Key Design Decisions

- **UUIDs**: All primary keys use `uuid().defaultRandom()` for globally unique, non-sequential IDs.
- **Composite Keys**: `memberships` and `usage_metrics` use composite primary keys (`workspaceId + userId` / `workspaceId + metricName`).
- **Enums**: PostgreSQL `pgEnum` for `workspace_role` ("owner", "admin", "member") and `subscription_status` ("active", "trialling", "past_due", "cancelled", "unpaid", "paused").
- **Cascading Deletes**: All workspace-scoped tables cascade on workspace deletion.

## 2. Repository Pattern

All database access is encapsulated in repository objects at `packages/db/src/repositories/`:

| Repository               | Key Methods                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `UserRepository`         | `findByEmail`, `findById`, `create`, `update`                                             |
| `WorkspaceRepository`    | `create`, `findBySlug`, `getMembers`, `addMember`                                         |
| `SubscriptionRepository` | `upsertSubscription`, `upsertCustomer`, `getActiveSubscription`, `getCustomerByWorkspace` |
| `UsageRepository`        | `upsertUsage`, `getMetric`                                                                |
| `MetricsRepository`      | `getDashboardMetrics` (parallel aggregate: members, tasks, usage, subscription)           |
| `PermissionRepository`   | `getPermissionsForRole`, `checkPermission`                                                |
| `AuditRepository`        | `create`, `getByWorkspace`                                                                |
| `InvitationRepository`   | `create`, `findByToken`, `listPending`                                                    |
| `TokenRepository`        | `create`, `findByToken`, `deleteByUserId`                                                 |
| `TasksRepository`        | `create`, `findByWorkspace`, `update`, `delete`                                           |

**Rules**:

- Repositories are the **only** layer that imports Drizzle query primitives (`eq`, `and`, `count`, etc.).
- Controllers and Services never construct raw queries — they call repository methods.
- All workspace-scoped queries **must** filter by `workspaceId` to enforce multi-tenant isolation.

## 3. Migration Workflow

### Generate a migration after schema changes

```bash
cd packages/db
pnpm generate
```

This creates a new SQL snapshot in the `drizzle/` folder.

### Push changes to Neon

```bash
cd packages/db
pnpm push
```

### Browse data visually

```bash
cd packages/db
pnpm studio
```

Opens Drizzle Studio in the browser connected to your Neon database.

## 4. Multi-Tenant Isolation

Multi-tenancy is enforced at three levels:

```text
1. Middleware (workspaceGuard)
   └─ Extracts workspaceId from x-workspace-id header or cookie
   └─ Validates user is a member of the workspace
   └─ Sets c.set("workspaceId", id) on the Hono context

2. Controller
   └─ Reads workspaceId from c.get("workspaceId")
   └─ Passes it to the Service layer

3. Repository
   └─ ALL queries include WHERE workspace_id = $workspaceId
   └─ This is NOT optional — it is a strict architectural rule
```

## 5. Billing Schema

The billing schema is **provider-agnostic**. It stores standardized data regardless of whether the payment came from LemonSqueezy or Creem.io:

```text
customers                      subscriptions
┌─────────────────────┐       ┌─────────────────────────┐
│ id (UUID)           │       │ id (UUID)               │
│ workspace_id (FK)   │◄──────│ workspace_id (FK)       │
│ provider_customer_id│       │ provider_subscription_id │
│ created_at          │       │ plan_id                 │
└─────────────────────┘       │ variant_id              │
                              │ status (enum)           │
                              │ next_payment_at         │
                              │ ends_at                 │
                              │ created_at / updated_at │
                              └─────────────────────────┘
```

The `provider_customer_id` and `provider_subscription_id` fields store the external IDs from the active payment provider. The `BillingService` normalizes webhook payloads from any provider into a `StandardizedSubscriptionData` structure before writing to the DB.

## 6. Testing Bridge (Postgres → SQLite)

For fast logic tests without hitting a live database:

1. **`createTestDb()`** in `packages/testing` spins up a `better-sqlite3` in-memory instance
2. Mock tables mirror the `pgTable` definitions as `sqliteTable`
3. Repository pattern makes it trivial to swap the DB client

```typescript
import { createTestDb, resetTestDb, closeTestDb } from "@workspace/testing";

describe("BillingService", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });
  afterEach(() => {
    resetTestDb();
  });
  afterAll(() => {
    closeTestDb();
  });

  it("should sync subscription", async () => {
    const service = createBillingService(db);
    // Real queries against in-memory SQLite
  });
});
```
