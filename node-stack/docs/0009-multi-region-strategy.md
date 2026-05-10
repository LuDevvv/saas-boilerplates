# ADR 0009 — Multi-region deployment strategy

**Status:** Proposed  
**Date:** 2026-05-09

## Context

As the platform grows, users in different geographic regions will experience latency from a single-region deployment. A multi-region strategy is needed to:
- Reduce read latency for globally distributed users
- Provide fault tolerance against a single region outage
- Comply with data residency requirements (EU GDPR, etc.)

## Decision

### Phase 1 — CDN + static assets (lowest effort, highest impact)

All static assets (dashboard JS/CSS bundles, images) served via a global CDN (Cloudflare, Vercel Edge, AWS CloudFront). No code changes required — only deployment config.

### Phase 2 — Read replicas (see ADR 0010)

Deploy PostgreSQL read replicas in secondary regions. The `packages/db` layer routes SELECT-only queries to the nearest replica using `READ_REPLICA_URL`. Writes always go to the primary region.

Constraints:
- RLS policies must be identical on all replicas (managed via schema migrations)
- Replica lag is acceptable for most reads (< 100ms typically)
- `withTenantTx` (which executes DML) always hits the primary

### Phase 3 — API edge deployment

Deploy the NestJS API to edge regions (fly.io machines, AWS ECS multi-region, etc.) with:
- Stateless API instances (no in-memory state, all state in Postgres/Redis)
- Redis cluster with cross-region replication for cache and sessions
- `REDIS_URL` per region pointing to the nearest Redis node

Session tokens are JWTs (stateless) so any API instance can verify them without cross-region calls.

### Phase 4 — Active-active (advanced)

For full active-active multi-master, PostgreSQL logical replication or CockroachDB would be required. This is out of scope for v1.

## Data residency

- EU users: deploy primary Postgres in `eu-west-1` or `eu-central-1`
- US users: replica in `us-east-1` with reads routed by `X-User-Region` header
- Data that must not leave the EU (PII, audit logs): write-only to the EU primary

Implement region routing at the load balancer (Cloudflare Workers, nginx geo module) by setting `X-Target-Region` header upstream.

## Consequences

- Phase 1 is zero-risk and deployable immediately.
- Phase 2 requires the read replica implementation in `packages/db` (ADR 0010).
- Phase 3 requires making Redis cluster-aware (`ioredis` cluster mode).
- Phase 4 (active-active) requires significant architectural changes and is deferred.
