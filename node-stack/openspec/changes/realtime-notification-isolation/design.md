# Design: Realtime & Notification Isolation

## Technical Approach

The design focuses on implementing a global Redis prefix across all components that use Redis Pub/Sub. This will be achieved by:
1.  Extending the global environment configuration to include `REDIS_PREFIX`.
2.  Configuring the `RedisIoAdapter` (Socket.IO) to use this prefix as its `key`.
3.  Updating the `EventBridgeService` to dynamically prefix all its Pub/Sub channels.

This ensures that different environments or projects sharing the same Redis instance stay isolated.

## Architecture Decisions

### Decision: Prefixed Redis Channels
**Choice**: Use `REDIS_PREFIX` as a prefix for all Pub/Sub channels and Socket.IO internal keys.
**Alternatives considered**: 
- Using different Redis databases (e.g. `db1`, `db2`). Rejected because some Redis managed services (like Upstash or certain cloud providers) only support `db0`.
- Using different Redis instances. Rejected because it increases infrastructure cost.
**Rationale**: Prefixing is the most portable and standard way to achieve multi-tenant isolation in shared Redis environments.

### Decision: Mandatory Prefix with Fallback
**Choice**: Make the prefix mandatory in the configuration schema but provide a safe default (`node_stack_dev`) for local development.
**Alternatives considered**: Making it optional and using empty string. Rejected because it risks accidental cross-talk if not explicitly set in staging/prod.
**Rationale**: Enforcement through schema validation prevents misconfiguration.

## Data Flow

1.  **Environment Variable** (`REDIS_PREFIX`) → **ConfigService**.
2.  **ConfigService** → **RedisIoAdapter** (sets `key` for cross-process communication).
3.  **ConfigService** → **EventBridgeService** (prefixes internal event channels).
4.  **Backend Event** → **EventEmitter2** → **EventBridgeService** (psubscribe/publish with prefix).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/config/src/index.ts` | Modify | Add `REDIS_PREFIX` to validation schema and default values. |
| `apps/api/src/realtime/redis-io.adapter.ts` | Modify | Update constructor to accept and use the prefix for `createAdapter`. |
| `apps/api/src/realtime/event-bridge.service.ts` | Modify | Update `psubscribe` and `publish` logic to use prefixed channels. |
| `apps/worker/src/worker.module.ts` (if applicable) | Audit | Check if worker uses any custom Pub/Sub that needs prefixing. |
| `.env.example` | Modify | Add `REDIS_PREFIX` with explanation. |

## Interfaces / Contracts

No new interfaces are required, but internal logic for channel naming will change:
```typescript
const channel = `${this.prefix}:internal_events:${type}`;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Redis Pub/Sub Isolation | Run two test instances with different prefixes and verify they don't receive each other's messages. |
| Unit | Channel Naming | Verify that `EventBridgeService` correctly computes prefixed names. |

## Migration / Rollout

No data migration required as Pub/Sub is ephemeral. Rollout consists of updating environment variables.

## Open Questions

- [ ] Does `BullMQ` (used in `packages/queue`) already support prefixing? (Usually yes, but need to check if it's currently used).
