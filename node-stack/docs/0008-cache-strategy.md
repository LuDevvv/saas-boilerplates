# ADR 0008 — Caching Strategy

**Status:** Accepted  
**Date:** 2026-05-09

## Context

The platform needs a caching layer to reduce database load and improve response times, especially for:
- Workspace membership lookups (hit on every authenticated request)
- AI token usage counts (queried per request for quota enforcement)
- Feature flags (read-heavy, rarely change)
- Session validation (queried on every request)

In a horizontally-scaled deployment, caches on individual instances can become stale when another instance modifies the underlying data.

## Decision

### Cache technology

Redis via `@node-stack/cache` (`CacheService` wrapping ioredis). A single Redis instance with configurable prefix and namespace per service.

### Key structure

```
cache:{namespace}:{tenantId}:{key}
```

Example: `cache:default:ws_abc123:members`

### TTL policy

| Data type | TTL | Rationale |
|-----------|-----|-----------|
| Session token | 5 min | Short-lived; refresh extends it |
| Workspace config | 5 min | Updated infrequently |
| Members list | 5 min | Invalidated on membership change |
| Feature flags | 10 min | Rarely change |
| AI usage quota | 1 min | Must be reasonably fresh for billing |
| API key hash | 5 min | Revocation must propagate within 5 min |

### Cache invalidation

Three strategies used:
1. **Time-based expiry** — TTL ensures eventual consistency without explicit invalidation
2. **Explicit invalidation** — `@CacheInvalidate(["pattern"])` decorator on mutation endpoints
3. **Pub/sub broadcast** — when an instance invalidates a key, it publishes to `__cache_invalidation__` so other replicas invalidate their copies immediately

### Multi-replica coherence (Phase 5a)

`CacheService.invalidateAndBroadcast()`:
1. Deletes all matching keys on the local instance
2. Publishes `{ pattern, tenantId }` to the `__cache_invalidation__` Redis channel
3. All instances have a subscriber (`onModuleInit`) that calls `invalidate()` on receipt

This ensures near-instant cross-replica coherence without requiring sticky sessions or a centralized cache gateway.

### Distributed locking

For cron jobs that must run on exactly one replica:
```typescript
const token = await cache.tryAcquireLock("cron:cleanup", 300, randomUUID());
if (!token) return; // another replica holds the lock
try { ... } finally { await cache.releaseLock("cron:cleanup", token); }
```

Uses atomic `SET key NX EX` + a Lua script for conditional release.

## Consequences

- `invalidateAndBroadcast` is slightly slower than `invalidate` (one extra Redis PUBLISH).
- The pub/sub subscriber creates a dedicated Redis connection per `CacheService` instance.
- The `__cache_invalidation__` channel is not namespaced (it's global per Redis instance) — this is intentional so cross-service invalidations work if needed.
- Cache stampede is possible on TTL expiry for high-traffic keys. Mitigate with `getOrSet()` staggered TTLs.
