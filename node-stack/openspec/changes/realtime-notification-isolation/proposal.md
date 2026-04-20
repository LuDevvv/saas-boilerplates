# Proposal: Realtime & Notification Isolation

## Intent

The current Realtime and Notification modules lack cross-process and environment isolation in Redis. If multiple environments (staging, production) or different projects share the same Redis instance, Pub/Sub messages and Socket.IO events can "leak" between them, causing unexpected behavior and potential security risks. This change aims to implement strict prefixing and namespace isolation.

## Scope

### In Scope
- Implement a configurable `REDIS_PREFIX` for the `RedisIoAdapter`.
- Implement prefixing for custom Redis Pub/Sub channels used in `EventBridgeService`.
- Audit `NotificationService` to ensure multi-tenant isolation (already partially implemented with rooms, but needs review).
- Update environment variable documentation for `REDIS_PREFIX`.

### Out of Scope
- Migrating existing Redis data (Pub/Sub is ephemeral).
- Implementing new notification channels (e.g. SMS).

## Approach

1.  **Redis Adapter Isolation**: Pass a `key` or `requestsTimeout`? Actually, `socket.io-redis` (or the newer `@socket.io/redis-adapter`) supports a prefix/key. We will use `configService.get('REDIS_PREFIX')` to set this.
2.  **Event Bridge Isolation**: Update `EventBridgeService` to prepend the prefix to all channel names (e.g., `${prefix}:internal_events:*`).
3.  **Config Extension**: Add `REDIS_PREFIX` to the global configuration validation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/api/src/realtime/redis-io.adapter.ts` | Modified | Add prefix to Redis adapter. |
| `apps/api/src/realtime/event-bridge.service.ts` | Modified | Add prefix to internal event channels. |
| `packages/config/src/index.ts` | Modified | Add `REDIS_PREFIX` to schema. |
| `.env.example` | Modified | Document `REDIS_PREFIX`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Interruption of realtime events during deployment | Medium | Pub/Sub is ephemeral; standard deployment strategies handle this. |
| Incorrect prefix causing silent failures | Low | Validation in ConfigService to ensure a prefix exists. |

## Rollback Plan

Revert the changes and remove the `REDIS_PREFIX` from environment variables. The system will fall back to default (unprefixed) behavior.

## Dependencies

- No external dependencies beyond the existing `ioredis` and `@socket.io/redis-adapter`.

## Success Criteria

- [ ] Socket.IO events are isolated by prefix (verified via multiple instances with different prefixes).
- [ ] Internal event bridge messages are isolated by prefix.
- [ ] No regression in notification delivery.
