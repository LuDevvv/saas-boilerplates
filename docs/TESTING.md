# 🧪 Testing Guide

This project uses a **dual-pool Vitest architecture** to support both Edge (Cloudflare Workers) and Logic (Service/DB) testing. This approach gives us fast feedback loops for business logic while still validating edge-specific behavior.

## 1. Test File Conventions

| Pattern     | Pool  | Runner                                        | Purpose                                | Example                   |
| ----------- | ----- | --------------------------------------------- | -------------------------------------- | ------------------------- |
| `*.test.ts` | Edge  | `@cloudflare/vitest-pool-workers` + Miniflare | Middleware, Routes, Integration        | `authGuard.test.ts`       |
| `*.spec.ts` | Logic | Standard Node.js                              | Services, Repositories, Business Logic | `billing.service.spec.ts` |

## 2. Running Tests

```bash
# Run all tests (both pools, sequentially)
pnpm test

# Run only Edge tests (Cloudflare sandbox)
pnpm run test:edge

# Run only Logic tests (SQLite bridge)
pnpm run test:logic

# Watch mode
pnpm run test:watch
```

## 3. Edge Pool (`*.test.ts`)

These tests run inside a Cloudflare Workers emulator (Miniflare) and have access to real Cloudflare bindings:

- **KV Namespaces**: In-memory KV for cache, rate limiting
- **R2 Buckets**: Simulated object storage
- **Queues**: Mock queue producers/consumers
- **Environment Variables**: From `wrangler.toml` test values

### Use for:

- HTTP endpoint integration tests (full request lifecycle)
- Middleware behavior (auth guards, rate limiting, CORS)
- Cloudflare binding interactions (R2 uploads, KV reads)

### Example:

```typescript
// auth.test.ts (Edge Pool)
import { env, createExecutionContext } from "cloudflare:test";
import app from "../app";

describe("POST /api/auth/login", () => {
  it("should return 401 for invalid credentials", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "bad@test.com", password: "wrong" }),
      headers: { "Content-Type": "application/json" },
    });

    const ctx = createExecutionContext();
    const res = await app.fetch(req, env, ctx);

    expect(res.status).toBe(401);
  });
});
```

## 4. Logic Pool (`*.spec.ts`)

These tests run in straight Node.js with an **in-memory SQLite database** that mirrors the production Postgres schema. This gives us real database testing at near-zero cost.

### Use for:

- Service layer business logic
- Repository query behavior
- Data transformation and validation
- Billing normalization logic

### SQLite Test Bridge

Located in `packages/testing/src/db-test-client.ts`:

```typescript
import {
  createTestDb,
  resetTestDb,
  closeTestDb,
  testUsers,
} from "@workspace/testing";
import { createBillingService } from "@workspace/services";

describe("BillingService", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb(); // Fresh in-memory SQLite
  });

  afterEach(() => {
    resetTestDb(); // Clear all data
  });

  afterAll(() => {
    closeTestDb(); // Release memory
  });

  it("should sync a subscription from normalized data", async () => {
    const service = createBillingService(db);
    const result = await service.syncSubscription({
      workspaceId: "ws-123",
      userId: "user-456",
      providerSubscriptionId: "sub_abc",
      providerCustomerId: "cus_xyz",
      planId: "plan_pro",
      variantId: "var_monthly",
      status: "active",
      nextPaymentAt: new Date(),
      endsAt: null,
    });

    expect(result.success).toBe(true);
  });
});
```

### Why SQLite Instead of Postgres?

| Concern             |    SQLite Bridge     |        Live Postgres        |
| ------------------- | :------------------: | :-------------------------: |
| Execution speed     |       **< 1s**       |       3-5s per suite        |
| External dependency |         None         |    Requires Neon/Docker     |
| CI compatibility    |    ✅ Zero config    | ⚠️ Requires DB provisioning |
| Schema accuracy     | ~95% (close mapping) |            100%             |

The slight schema mismatch (e.g., no `pgEnum` in SQLite) is handled by the mock table definitions in `packages/testing`.

## 5. Testable Architecture

The codebase is designed for testability through strict dependency injection:

```text
Controller(c)
  └─ extracts db, env from Hono context
  └─ passes to Service as arguments

Service(db)
  └─ receives db as parameter (not global)
  └─ calls Repository methods

Repository
  └─ accepts any Drizzle DB instance (Postgres or SQLite)
```

This means:

- **Services** can be tested with a SQLite db (Logic Pool)
- **Controllers** can be tested via real HTTP requests (Edge Pool)
- **Repositories** can be unit tested with the SQLite bridge

## 6. Adding New Tests

### For a new API endpoint

Create `module-name.test.ts` in the module directory. Use the Edge pool to test the full HTTP lifecycle including middleware.

### For new business logic

Create `module-name.spec.ts` in the module directory. Use `createTestDb()` from `@workspace/testing` and test the service methods directly.

### Test Naming Conventions

```
✅ auth.service.spec.ts     → Logic pool (service logic)
✅ authGuard.test.ts         → Edge pool (middleware integration)
✅ billing.service.spec.ts   → Logic pool (billing normalization)
✅ checkout.test.ts           → Edge pool (full checkout flow)
```
