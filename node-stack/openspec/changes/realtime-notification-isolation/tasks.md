# Tasks: Realtime & Notification Isolation

## Phase 1: Configuration & Foundation

- [ ] 1.1 Update `packages/config/src/index.ts` to include `REDIS_PREFIX` in the Zod schema with a default value of `node_stack_dev`.
- [ ] 1.2 Update `.env.example` at the root with a new entry for `REDIS_PREFIX`.
- [ ] 1.3 Audit `packages/queue/src/index.ts` to see if `prefix` is already passed to BullMQ (BullMQ uses prefixes for its own isolation).

## Phase 2: Redis Adapter & Event Bridge Implementation

- [ ] 2.1 Modify `apps/api/src/realtime/redis-io.adapter.ts` to fetch `REDIS_PREFIX` and pass it as the `key` to the `createAdapter` function.
- [ ] 2.2 Update `apps/api/src/realtime/event-bridge.service.ts` to include the `REDIS_PREFIX` in all channel names (e.g. `${prefix}:internal_events:*`).
- [ ] 2.3 Update `apps/api/src/realtime/realtime.service.ts` (if it publishes to custom channels) to use the prefixed names.

## Phase 3: Tenant Isolation Review

- [ ] 3.1 Audit `apps/api/src/realtime/realtime.gateway.ts` to ensure `validateMembership` is strictly applied to all rooms except personal `user:${id}`.
- [ ] 3.2 Add a check in `realtime.gateway.ts` to explicitly reject any room join attempt that doesn't follow the `user:` or `workspace:` pattern.

## Phase 4: Testing & Verification

- [ ] 4.1 Create an integration test (or manual script) that starts two Socket.IO clients with different prefixes and verifies they are isolated.
- [ ] 4.2 Verify that `EventEmitter2` events are correctly synchronized between instances with the same prefix.
- [ ] 4.3 Verify that `EventEmitter2` events are NOT leaked to instances with different prefixes.

## Phase 5: Documentation & Cleanup

- [ ] 5.1 Document the use of `REDIS_PREFIX` for multi-environment deployments in `docs/REALTIME.md` (if it exists) or create it.
