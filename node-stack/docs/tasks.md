# Node-Stack Production Readiness Tasks

> Objective: Bring Node-Stack from **7.8/10** to **10/10** production readiness.

---

## Phase 1 — Critical Fixes (P0)

### P0-001: JWT Session Validation

**Priority**: CRITICAL
**Effort**: 1h
**File**: `apps/api/src/auth/strategies/jwt.strategy.ts`

**Problem**: JWT `validate()` doesn't check if session exists in DB. Revoked sessions work until token expires.

**Requirements**:

- Import `db, schema, eq` from `@node-stack/db`
- Query `sessions` table by `payload.sessionId`
- Throw `UnauthorizedException` if session not found or expired
- Remove fallback `"default-secret-change-in-production"` — throw error if env not set

**Acceptance**:

```bash
# After logout, old JWT should return 401
curl -H "Authorization: Bearer $OLD_TOKEN" http://localhost:3000/auth/me
# → 401 Unauthorized
```

---

### P0-002: Transaction Boundaries — Invitation Acceptance

**Priority**: CRITICAL
**Effort**: 2h
**File**: `apps/api/src/workspaces/invitations.service.ts`

**Problem**: `acceptInvitation()` creates membership and updates invitation in separate queries. Partial state on failure.

**Requirements**:

- Wrap `acceptInvitation()` in `withTransaction()`
- Inside transaction: create membership + update invitation status
- If any query fails, all rolls back

**Acceptance**:

```typescript
// Inside acceptInvitation method
await withTransaction(async (tx) => {
  await tx.insert(schema.memberships).values({ ... });
  await tx.update(schema.workspaceInvitations)
    .set({ status: "accepted" })
    .where(eq(schema.workspaceInvitations.id, invitation.id));
});
```

---

### P0-003: Transaction Boundaries — Workspace Creation

**Priority**: CRITICAL
**Effort**: 1h
**File**: `apps/api/src/workspaces/workspaces.service.ts`

**Problem**: Workspace creation + owner membership not atomic.

**Requirements**:

- Wrap workspace creation + membership insertion in transaction
- Use `withTransaction()` from `@node-stack/db`

**Acceptance**:

```typescript
await withTransaction(async (tx) => {
  const [workspace] = await tx
    .insert(schema.workspaces)
    .values({ name, slug })
    .returning();
  await tx.insert(schema.memberships).values({
    workspaceId: workspace.id,
    userId,
    role: "owner",
  });
  return workspace;
});
```

---

### P0-004: Transaction Boundaries — Billing Checkout

**Priority**: CRITICAL
**Effort**: 2h
**File**: `apps/api/src/billing/billing.service.ts`

**Problem**: Checkout creation doesn't write outbox event atomically.

**Requirements**:

- Wrap `createCheckout()` in transaction
- Inside: create checkout via PolarProvider + write outbox event
- Use `withTransaction()` from `@node-stack/db`

**Acceptance**:

```typescript
await withTransaction(async (tx) => {
  const checkout = await this.polarProvider.createCheckoutSession({ ... });
  await tx.insert(schema.outbox).values({
    eventType: "checkout.created",
    payload: { checkoutUrl: checkout.url, workspaceId: data.workspaceId },
  });
  return checkout;
});
```

---

### P0-005: Transaction Boundaries — User Registration

**Priority**: CRITICAL
**Effort**: 1h
**File**: `apps/api/src/auth/auth.service.ts`

**Problem**: User + session creation not atomic.

**Requirements**:

- Wrap `register()` user creation + session creation in transaction
- Use `withTransaction()` from `@node-stack/db`

**Acceptance**:

```typescript
await withTransaction(async (tx) => {
  const [user] = await tx.insert(schema.users).values({ ... }).returning();
  await tx.insert(schema.sessions).values({ ... });
  return user;
});
```

---

### P0-006: Remove Default JWT Secret Fallback

**Priority**: CRITICAL
**Effort**: 30min
**File**: `apps/api/src/auth/strategies/jwt.strategy.ts`

**Problem**: `JWT_SECRET` has dangerous fallback.

**Requirements**:

- Remove `"default-secret-change-in-production"` fallback
- Throw `Error` if `JWT_SECRET` env var not set at app startup
- Validate in `main.ts` or constructor

**Acceptance**:

```typescript
// jwt.strategy.ts constructor
const secret = configService.get("JWT_SECRET");
if (!secret) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

---

### P0-007: Transaction Boundaries — User Login

**Priority**: CRITICAL
**Effort**: 1h
**File**: `apps/api/src/auth/auth.service.ts`

**Problem**: Login creates session in separate query from user validation.

**Requirements**:

- Wrap login validation + session creation in transaction
- Include old session deletion for refresh token rotation

**Acceptance**:

```typescript
await withTransaction(async (tx) => {
  // Delete old session if exists
  if (oldSessionId) {
    await tx.delete(schema.sessions).where(eq(schema.sessions.id, oldSessionId));
  }
  // Create new session
  await tx.insert(schema.sessions).values({ ... });
});
```

---

### P0-008: Outbox Event on Invitation Creation

**Priority**: CRITICAL
**Effort**: 1h
**File**: `apps/api/src/workspaces/invitations.service.ts`

**Problem**: Invitation creation doesn't write outbox event for email delivery.

**Requirements**:

- After creating invitation, write outbox event `invitation.sent`
- Wrap invitation creation + outbox write in transaction

**Acceptance**:

```typescript
await withTransaction(async (tx) => {
  const [invitation] = await tx.insert(schema.workspaceInvitations).values({ ... }).returning();
  await tx.insert(schema.outbox).values({
    eventType: "invitation.sent",
    payload: { invitationId: invitation.id, email: dto.email },
  });
});
```

---

## Phase 2 — High Impact (P1)

### P1-001: Global Exception Filter

**Priority**: HIGH
**Effort**: 3h
**Files**: `apps/api/src/common/filters/http-exception.filter.ts`, `apps/api/src/main.ts`

**Problem**: No consistent error response format. Errors not transformed to `{ code, message, statusCode }`.

**Requirements**:

- Create `HttpExceptionFilter` implementing `ExceptionFilter`
- Transform all errors to: `{ statusCode, error: "CODE", message: "..." }`
- Register as global filter in `main.ts`

**Acceptance**:

```typescript
// apps/api/src/common/filters/http-exception.filter.ts
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";
    response.status(status).json({
      statusCode: status,
      error: getErrorName(status),
      message,
    });
  }
}

// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

---

### P1-002: Global Validation Pipe

**Priority**: HIGH
**Effort**: 2h
**Files**: `apps/api/src/main.ts`, all DTOs

**Problem**: DTOs not validated globally. Invalid data reaches business logic.

**Requirements**:

- Enable `ValidationPipe` in `main.ts`
- Add `class-validator` decorators to all DTOs
- Add `whitelist: true`, `transform: true`

**Acceptance**:

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);
```

---

### P1-003: Cache Key with Tenant ID

**Priority**: HIGH
**Effort**: 2h
**File**: `packages/cache/src/cache.service.ts`

**Problem**: Cache keys don't include tenantId. Cross-tenant cache pollution.

**Requirements**:

- Add optional `tenantId` parameter to `key()` method
- Key format: `cache:{namespace}:{tenantId}:{key}`
- Update all cache usage to pass `tenantId`

**Acceptance**:

```typescript
// cache.service.ts
private key(key: string, tenantId?: string): string {
  const parts = ["cache", this.namespace, tenantId, key].filter(Boolean);
  return parts.join(":");
}

// Usage
cache.set("workspaces", data, 300, workspaceId);
cache.get("workspaces", workspaceId);
```

---

### P1-004: Cache Invalidation on Mutations

**Priority**: HIGH
**Effort**: 8h
**Files**: All service files

**Problem**: Mutations don't invalidate related cache keys. Stale data served.

**Requirements**:

- After each mutation, invalidate relevant cache keys
- Pattern-based invalidation: `workspaces:{workspaceId}:*`
- Document invalidation patterns per resource

**Acceptance**:

```typescript
// After workspace update
await cacheService.invalidate(`workspaces:${workspaceId}`);

// After member add/remove
await cacheService.invalidate(`workspaces:${workspaceId}:members`);
```

---

### P1-005: Missing Database Indexes

**Priority**: HIGH
**Effort**: 30min
**File**: `packages/db/src/schema/`

**Problem**: Missing indexes on frequently queried fields.

**Requirements**:

- Add `idx_invitations_token` on `workspaceInvitations.token`
- Add `idx_memberships_user_id` on `memberships.userId`
- Add `idx_outbox_retry` on `outbox.processed, outbox.retryCount`

**Acceptance**:

```sql
CREATE INDEX idx_invitations_token ON workspace_invitations(token);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_outbox_retry ON outbox(processed, retry_count);
```

---

### P1-006: Outbox Events on All Mutations

**Priority**: HIGH
**Effort**: 6h
**Files**: `workspaces.service.ts`, `billing.service.ts`, `auth.service.ts`

**Problem**: Critical mutations don't write outbox events.

**Requirements**:

- Write outbox event for:
  - `user.registered` — on register
  - `workspace.created` — on workspace creation
  - `membership.added` — on member add
  - `membership.removed` — on member remove
  - `checkout.created` — on checkout
  - `invitation.accepted` — on accept
  - `invitation.sent` — on create
- Wrap in transaction with business operation

**Acceptance**:

```typescript
// After each mutation, outbox event written
await tx.insert(schema.outbox).values({
  eventType: "workspace.created",
  payload: { workspaceId: workspace.id, userId },
});
```

---

### P1-007: Global Tenant ID Injection Middleware

**Priority**: HIGH
**Effort**: 4h
**Files**: `apps/api/src/common/middleware/tenant.middleware.ts`, `apps/api/src/common/decorators/tenant-id.decorator.ts`, `apps/api/src/app.module.ts`

**Problem**: Workspace ID must be manually extracted in every service. Error-prone and repetitivo.

**Requirements**:

- Create middleware that extracts workspace ID from route params
- Set on request object for service access
- Works with workspace guard
- Create `@TenantId()` decorator to inject tenantId into controllers

**Acceptance**:

```typescript
// apps/api/src/common/middleware/tenant.middleware.ts
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId =
      req.params?.id ||
      req.params?.workspaceId ||
      req.params?.["ws-id"] ||
      (req.query?.workspaceId as string);

    if (tenantId) {
      (req as any).tenantId = tenantId;
    }
    next();
  }
}

// apps/api/src/common/decorators/tenant-id.decorator.ts
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.tenantId;
  },
);

// apps/api/src/app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes("*");
  }
}
```

---

### P1-008: Rate Limit Response Headers

**Priority**: HIGH
**Effort**: 1h
**File**: `apps/api/src/common/guards/rate-limit.guard.ts`

**Problem**: Rate limit responses don't include standard headers. Clients don't know how many requests remain.

**Requirements**:

- Add `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- Return 429 with `Retry-After` header when limit exceeded

**Acceptance**:

```bash
curl -v http://localhost:3000/health
# < X-RateLimit-Limit: 100
# < X-RateLimit-Remaining: 99
# < X-RateLimit-Remaining: 98 (after second call)
# < X-RateLimit-Remaining: 0 (after limit)
# < Retry-After: 60 (when exceeded)
```

---

### P1-009: Remove `any` Types from Controllers

**Priority**: HIGH
**Effort**: 4h
**Files**: All controllers

**Problem**: Controllers use `any` for user and workspace. Loss of type safety and autocompletion.

**Requirements**:

- Create interfaces for `UserPayload` and `WorkspaceContext`
- Update `@CurrentUser()` and `@Workspace()` decorators to return typed values
- Replace `any` with proper types in all controllers

**Acceptance**:

```bash
# 1. No `: any` in controllers for user/workspace
grep -n ": any" apps/api/src/*/controllers/*.ts
# → Should show no matches for user/workspace

# 2. Autocompletion works in IDE
# `user.` should show `id`, `email`, `sessionId`
# `workspace.` should show `id`, `name`, `role`

# 3. Build passes
pnpm build
```

---

### P1-010: Strict TypeScript Configuration

**Priority**: HIGH
**Effort**: 2h
**File**: `tsconfig.json`

**Problem**: TypeScript configuration too permissive, allowing `any` and other unsafe types.

**Requirements**:

- Enable strict TypeScript options:
  - `strict: true`
  - `noImplicitAny: true`
  - `strictNullChecks: true`
  - `strictFunctionTypes: true`
  - `strictBindCallApply: true`
  - `strictPropertyInitialization: true`
  - `noImplicitThis: true`
  - `useUnknownInCatchVariables: true`
  - `exactOptionalPropertyTypes: true`
  - `noImplicitReturns: true`
  - `noFallthroughCasesInSwitch: true`
  - `noUncheckedIndexedAccess: true` (optional)
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
- Fix resulting type errors

**Acceptance**:

```bash
# 1. Compilation without type errors
pnpm build
# → Should have no type errors (only warnings possibly)

# 2. No `: any` in codebase (except where justified)
grep -r ": any" apps/api/src/ --include="*.ts" | grep -v "node_modules"
# → Should show no matches or only in external types

# 3. Promises have generic types
grep -r "Promise<" apps/api/src/ --include="*.ts"
# → Should show many results, indicating proper typing
```

---

## Phase 2 — Performance (P2)

### P2-001: Connection Pooling per Tenant

**Priority**: MEDIUM
**Effort**: 6h
**File**: `packages/db/src/index.ts`

**Problem**: Single connection pool for all tenants. No isolation or per-tenant scaling.

**Requirements**:

- Support multiple pools by tenant ID (optional)
- Maintain backward compatibility with default pool
- Add pool statistics endpoint
- Update health service to report pool stats

**Acceptance**:

```bash
# 1. Pool stats in health check
curl http://localhost:3000/health
# → {
#   "status": "healthy",
#   "dependencies": {
#     "database": {
#       "status": "up",
#       "latencyMs": 2,
#       "poolStats": {
#         "default": { "total": 20, "idle": 15, "waiting": 0 },
#         "ws-123": { "total": 20, "idle": 18, "waiting": 2 }
#       }
#     }
#   }
# }

# 2. Multiple tenants use separate pools
# Simulate requests for different workspaces
# Verify pool stats show separate pools

# 3. Backward compatibility
# Existing services continue to work with default pool
```

---

### P2-002: Cache-Aside Pattern with Refresh-Ahead

**Priority**: MEDIUM
**Effort**: 4h
**File**: `packages/cache/src/cache.service.ts`

**Problem**: No automatic cache refresh for hot data. Stale data served until TTL expires.

**Requirements**:

- Add `getOrSet(key, fetchFn, ttl)` method
- Implement background refresh when TTL < 20% remaining (configurable)
- Use exponential backoff for refresh failures
- Maintain backward compatibility with existing `get`/`set` methods

**Acceptance**:

```typescript
// 1. First call → cache miss, executes fetchFn
const value1 = await cacheService.getOrSet("key", fetchFn, 60);
// → fetchFn executed exactly once

// 2. Second call within TTL → cache hit, returns value without executing fetchFn
const value2 = await cacheService.getOrSet("key", fetchFn, 60);
// → fetchFn NOT executed again, value2 === value1

// 3. After 80% of TTL → still returns cached value, but triggers background refresh
const value3 = await cacheService.getOrSet("key", fetchFn, 60);
// → fetchFn NOT executed in this call (returns cached value)
//    But background refresh executes fetchFn once to update cache

// 4. After TTL expires → cache miss, executes fetchFn again
//    (wait for TTL to expire or force time)
const value4 = await cacheService.getOrSet("key", fetchFn, 60);
// → fetchFn executed again, value4 may differ from value1
```

---

### P2-003: Replace Outbox Polling with BullMQ

**Priority**: MEDIUM
**Effort**: 8h
**Files**:

- `packages/outbox-queue/` (new package)
- `apps/api/src/package.json`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/workspaces/workspaces.service.ts`
- `apps/api/src/workspaces/invitations.service.ts`
- `apps/api/src/billing/billing.service.ts`
- `apps/worker/src/package.json`
- `apps/worker/src/processors/outbox.processor.ts`
- `apps/worker/src/worker.module.ts`

**Problem**: Outbox processor uses polling (every 5s), causing delays and potential duplicate processing when scaled.

**Requirements**:

- Create new package `@node-stack/outbox-queue` with BullMQ queue and producer
- Modify API services to add job to queue after inserting into outbox table
- Replace worker's outbox processor with BullMQ worker
- Worker processes jobs by fetching outbox event, processing, and updating outbox table
- Handle retries via outbox table retry count (not BullMQ retries)
- Use exponential backoff for job re-enqueue on failure (if retries remain)
- Mark as processed after maxRetries to prevent infinite loops

**Acceptance**:

```bash
# 1. Outbox event triggers job
# After inserting outbox event (e.g., via registration)
# → Job added to "outbox" queue
# → Worker processes event within seconds (not 5s poll delay)

# 2. Successful processing
# → Outbox event marked as processed (processed=true)
# → No further processing

# 3. Failed processing (retryable)
# → Outbox event retryCount incremented
# → New job enqueued with delay (exponential backoff)
# → After delay, event processed again

# 4. Max retries exceeded
# → Outbox event marked as processed (to prevent infinite loops)
# → No further processing attempts

# 5. No duplicate processing when scaled
# → Only one worker processes each outbox event (due to job queue semantics)
```

---

### P2-004: Request ID Tracing

**Priority**: MEDIUM
**Effort**: 2h
**Files**: `apps/api/src/common/middleware/request-id.middleware.ts`, `apps/api/src/main.ts`

**Problem**: No request ID for log correlation across services.

**Requirements**:

- Create middleware that generates or extracts `X-Request-ID`
- Include in all log outputs
- Include in error responses
- Use `uuid` package for generation

**Acceptance**:

```bash
# 1. Request ID in logs
# Logs should include requestId field
# Example: {"timestamp":"...","level":"info","message":"Request processed","requestId":"abc-123"}

# 2. Request ID in error responses
curl -v http://localhost:3000/nonexistent
# → Header: X-Request-ID: abc-123

# 3. Request ID propagation
# If incoming request has X-Request-ID header, it should be preserved
# If not, a new UUID should be generated
```

---

### P2-005: Structured Logging

**Priority**: MEDIUM
**Effort**: 4h
**Files**: `apps/api/src/common/logger.ts`, replace all `console.log` with structured logger

**Problem**: `console.log` used in many places. No structured logging for production.

**Requirements**:

- Create structured logger with JSON output
- Include `timestamp`, `level`, `message`, `requestId`, `tenantId`, `userId` (when available)
- Replace all `console.log` with structured logger
- Use `pino` or `winston` for production-grade logging

**Acceptance**:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "Request processed",
  "requestId": "abc-123",
  "tenantId": "ws-456",
  "userId": "usr-789"
}
```

---

### P2-006: Database Query Logging (Development)

**Priority**: MEDIUM
**Effort**: 2h
**File**: `packages/db/src/index.ts`

**Problem**: No visibility into SQL queries in development.

**Requirements**:

- Enable Drizzle query logging in development
- Log slow queries (> 100ms)
- Add query duration to metrics

**Acceptance**:

```typescript
// packages/db/src/index.ts
export const db = drizzle(pool, {
  schema,
  logger:
    process.env.NODE_ENV === "development"
      ? (query, params) => {
          const start = Date.now();
          return () => {
            const duration = Date.now() - start;
            if (duration > 100) {
              console.log(`Slow query (${duration}ms): ${query}`);
            }
          };
        }
      : false,
});
```

---

### P2-007: BullMQ Job Retry Configuration

**Priority**: MEDIUM
**Effort**: 2h
**File**: `apps/worker/src/processors/`

**Problem**: Hardcoded retry values in BullMQ jobs.

**Requirements**:

- Make retry attempts, backoff strategy configurable via env
- Add dead-letter queue for failed jobs
- Add metrics for job success/failure rates

**Acceptance**:

```bash
# .env
BULLMQ_RETRY_ATTEMPTS=3
BULLMQ_RETRY_DELAY=5000
BULLMQ_RETRY_STRATEGY=exponential

# 1. Jobs retry according to config
# 2. Failed jobs go to dead-letter queue after max attempts
# 3. Metrics show success/failure rates
```

---

### P2-008: Idempotency Transaction Isolation

**Priority**: MEDIUM
**Effort**: 2h
**File**: `apps/api/src/common/guards/idempotency.guard.ts`

**Problem**: Race condition between idempotency check and execution.

**Requirements**:

- Use Redis distributed lock before processing
- Lock acquired before handler, released after response stored
- Return 409 if lock not acquired
- Ensure lock release on both success and failure

**Acceptance**:

```typescript
// Idempotency guard acquires lock before processing
const lockAcquired = await redis.set(`lock:${key}`, "1", "PX", 30000, "NX");
if (!lockAcquired) throw new ConflictException("Request in progress");
// ... process ...
// Finally release lock
await redis.del(`lock:${key}`);
```

---

### P2-009: Pagination Performance

**Priority**: MEDIUM
**Effort**: 2h
**File**: `packages/utils/src/pagination.ts`

**Problem**: Large offset-based pagination slow. Cursor-based pagination missing proper filtering.

**Requirements**:

- Ensure `decodeCursor` function exists and is used
- Ensure `paginate()` applies cursor filter before `orderBy()`
- Use `gt(schema.workspaces.id, cursorData.id)` for filtering
- Add `orderBy(schema.workspaces.id)` for deterministic ordering
- Validate no duplicate results between pages

**Acceptance**:

```bash
# 1. First page
curl "http://localhost:3000/workspaces?limit=5"
# → { data: [{id:"1"},{id:"2"},{id:"3"},{id:"4"},{id:"5"}], nextCursor: "eyJpZCI6IjUiLC...}", hasMore: true }

# 2. Second page (using nextCursor from first)
curl "http://localhost:3000/workspaces?limit=5&cursor=eyJpZCI6IjUiLC...}"
# → { data: [{id:"6"},{id:"7"},{id:"8"},{id:"9"},{id:"10"}], nextCursor: "...", hasMore: true }

# 3. No duplicates between pages
# Page 1 IDs: 1,2,3,4,5
# Page 2 IDs: 6,7,8,9,10
# → No overlap
```

---

### P2-010: Health Check Dependency Ordering

**Priority**: MEDIUM
**Effort**: 1h
**File**: `apps/api/src/health/health.service.ts`

**Problem**: Health checks not ordered by criticality. Database should be checked first.

**Requirements**:

- Check database first (most critical)
- Return HTTP 503 if any critical dependency down
- Separate liveness from readiness
- Add dependency order: database → redis → minio

**Acceptance**:

```bash
GET /health
{
  "status": "unhealthy",
  "checks": {
    "database": { "status": "up", "latency": 2 },
    "redis": { "status": "down", "error": "Connection refused" },
    "minio": { "status": "up", "latency": 5 }
  }
}
```

GET /health/live

# → { status: "ok" }

GET /health/ready

# → { status: "degraded" } (if any dependency down)

````

---

## Phase 3 — Polish (P3)

### P3-001: Repository Pattern

**Priority**: LOW
**Effort**: 12h
**File**: `packages/db/src/repositories/`

**Problem**: Services use raw `db.query.*` directly. No abstraction or tenant scoping.

**Requirements**:
- Create `BaseRepository<T>` abstract class
- Create `UserRepository`, `WorkspaceRepository`, `MembershipRepository`
- Auto-inject tenantId for workspace-scoped queries
- Inject repositories into services
- Migrate services to use repositories instead of raw `db`

**Acceptance**:
```typescript
// Base repository with tenant scoping
abstract class BaseRepository<T> {
  async findById(tenantId: string, id: string): Promise<T | null> {
    return db.query[this.table].findFirst({
      where: and(
        eq(this.table[this.tenantField], tenantId),
        eq(this.table.id, id),
      ),
    });
  }
}

// Usage in service
constructor(private workspaceRepo: WorkspaceRepository) {}
async getWorkspace(id: string) {
  return this.workspaceRepo.findById(workspaceId, id);
}
````

---

### P3-002: Feature Flags

**Priority**: LOW
**Effort**: 4h
**File**: `packages/config/src/feature-flags.ts`

**Problem**: No feature toggle mechanism.

**Requirements**:

- Create feature flag service with Redis backend
- Support workspace-level and user-level flags
- Add decorator `@FeatureFlag("billing-v2")`
- Add admin UI for toggling flags (optional)

**Acceptance**:

```typescript
@FeatureFlag("new-checkout-flow")
async checkout(...) { ... }

// In config service
const isEnabled = await featureFlagService.isEnabled("new-checkout-flow", workspaceId, userId);
```

---

### P3-003: API Versioning

**Priority**: LOW
**Effort**: 4h
**File**: `apps/api/src/main.ts`

**Problem**: No API versioning strategy.

**Requirements**:

- Support URL-based versioning: `/v1/auth`, `/v2/auth`
- Default to v1
- Document deprecation policy
- Add versioning middleware or controller prefixes

**Acceptance**:

```bash
GET /v1/auth/me  # Current version
GET /v2/auth/me  # Future version (if exists)
```

---

### P3-004: Circuit Breaker for External Services

**Priority**: LOW
**Effort**: 4h
**File**: `packages/billing-adapter/src/circuit-breaker.ts`

**Problem**: No resilience for external API calls (Polar, S3).

**Requirements**:

- Implement circuit breaker pattern
- Open circuit after 5 consecutive failures
- Half-open after 30 seconds
- Include in health check

**Acceptance**:

```typescript
const breaker = new CircuitBreaker(callPolarApi, {
  failureThreshold: 5,
  recoveryTimeout: 30000,
});
const result = await breaker.execute();
```

---

### P3-005: Request Compression

**Priority**: LOW
**Effort**: 1h
**File**: `apps/api/src/main.ts`

**Problem**: No gzip compression for responses.

**Requirements**:

- Enable `compression` middleware
- Compress responses > 1KB
- Exclude already-compressed formats (images, etc.)

**Acceptance**:

```typescript
import compression from "compression";
app.use(compression({ threshold: 1024 }));
```

---

### P3-006: CORS Configuration

**Priority**: LOW
**Effort**: 1h
**File**: `apps/api/src/main.ts`

**Problem**: No CORS configuration.

**Requirements**:

- Configure allowed origins from env
- Support credentials
- Preflight caching

**Acceptance**:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(",") || [],
  credentials: true,
  maxAge: 86400,
});
```

---

### P3-007: Helmet Security Headers

**Priority**: LOW
**Effort**: 30min
**File**: `apps/api/src/main.ts`

**Problem**: Missing security headers.

**Requirements**:

- Add `helmet` middleware
- Set CSP, HSTS, X-Frame-Options

**Acceptance**:

```typescript
import helmet from "helmet";
app.use(helmet());
```

---

### P3-008: Graceful Shutdown

**Priority**: LOW
**Effort**: 2h
**File**: `apps/api/src/main.ts`

**Problem**: No graceful shutdown handling.

**Requirements**:

- Handle SIGTERM/SIGINT
- Drain connections, stop accepting new requests
- Wait for in-flight requests to complete
- Close DB pool, Redis connection

**Acceptance**:

```typescript
process.on("SIGTERM", async () => {
  await app.close();
  await pool.end();
  process.exit(0);
});
```

---

### P3-009: Docker Production Configuration

**Priority**: LOW
**Effort**: 2h
**File**: `docker-compose.production.yml`

**Problem**: Production compose not fully optimized.

**Requirements**:

- Add resource limits (CPU, memory)
- Add logging driver configuration
- Add health check dependencies
- Add environment-specific overrides

**Acceptance**:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

---

### P3-010: Automated Migration on Deploy

**Priority**: LOW
**Effort**: 2h
**File**: `apps/api/Dockerfile`, `.github/workflows/deploy.yml`

**Problem**: Migrations run manually.

**Requirements**:

- Run migrations before app start in Docker
- Add migration status check to health endpoint
- Rollback support

**Acceptance**:

```dockerfile
# Dockerfile
CMD ["sh", "-c", "npm run db:migrate && node dist/main.js"]
```

---

## Summary

| Phase                | Tasks  | Total Effort | Impact                    |
| -------------------- | ------ | ------------ | ------------------------- |
| **P0 — Critical**    | 8      | 10h          | Security + Data Integrity |
| **P1 — High**        | 10     | 33h          | Performance + Reliability |
| **P2 — Performance** | 10     | 32h          | Scalability + DX          |
| **P3 — Polish**      | 10     | 30h          | Production Hardening      |
| **TOTAL**            | **38** | **105h**     | **10/10**                 |

---

## Execution Roadmap

### Week 1: Critical Fixes (P0)

- JWT session validation
- All transaction boundaries
- Remove default secret
- Outbox events

### Week 2: High Impact (P1)

- Exception filter + validation pipe
- Cache improvements
- Type safety fixes
- Database indexes

### Week 3: Performance (P2)

- BullMQ outbox
- Structured logging
- Cache-aside pattern
- Request tracing

### Week 4: Hardening (P3)

- Repository pattern
- Security headers
- Graceful shutdown
- Docker optimization

---

## Target Score After Each Phase

| After Phase | Score   |
| ----------- | ------- |
| Current     | 7.8/10  |
| After P0    | 8.5/10  |
| After P1    | 9.3/10  |
| After P2    | 9.7/10  |
| After P3    | 10.0/10 |
