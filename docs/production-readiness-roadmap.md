# Edge SaaS Production Readiness & Engineering Roadmap

**Role:** Principal Staff Software Engineer  
**Status:** DRAFT (Architecture Review Phase)  
**Target Runtime:** Cloudflare Workers (V8 Isolates)  
**Database Architecture:** Neon Serverless (HTTP)

---

## 1. Executive Summary

### Overview
The "Startup Edge Stack" is built on a highly modern, performance-oriented foundation. The decision to use **Hono**, **Drizzle**, and **Neon HTTP** aligns perfectly with the sub-50ms latency goals of a global edge platform. The service-repository split is clean, and the background job offloading is architecturally sound.

### Production Readiness Score: 8.5/10
The platform is technically "ready" for lower-stakes production workloads but requires hardening in **transactional integrity** and **distributed consistency** before handling high-value enterprise data at scale.

### Key Strengths
- **Low Bundle Footprint:** Strategic offloading of heavy dependencies (React Email, Resend) to a secondary worker.
- **Edge-First Auth:** JWT rotation and KV-cached permission guards provide elite performance.
- **Strict Typing:** OpenAPI integration ensures a robust consumer ecosystem.

### Key Risks
- **Data Inconsistency:** Fragile sequential DB writes in multi-step operations (e.g., workspace creation).
- **Lack of Mutation Idempotency:** Potential for duplicate bills or duplicate account creation on network retries.
- **Observability Gaps:** No distributed tracing between the Frontend, API, and Jobs Worker.

---

## 2. Improvement Areas

| Category | Rationale |
| :--- | :--- |
| **Data Integrity** | Moving from sequential `await` calls to serverless-safe transactions and idempotency keys to prevent data orphans. |
| **Performance** | Implementing composite indexes and optimizing KV cache invalidation logic. |
| **Security** | Hardening RBAC enforcement at the service level and securing webhook endpoints. |
| **Edge Optimization** | Reducing isolate cold starts by pruning unnecessary bindings and enforcing strict tree-shaking. |
| **Scalability** | Transitioning from global rate limits to per-workspace/per-user resource quotas. |

---

## 3. Sprint Execution Plan

### Sprint 1: Critical Reliability & Consistency
- **Objective:** Eliminate data corruption risks and fix privilege escalation vulnerabilities.
- **Theme:** Transactional safety and RBAC enforcement.

### Sprint 2: Stability & Webhook Hardening
- **Objective:** Secure the billing pipeline and optimize database access.
- **Theme:** Idempotency and Indexing.

### Sprint 3: Scalability & Performance Polish
- **Objective:** Improve global latency and prevent resource exhaustion.
- **Theme:** Multi-tenant rate limiting and Cache invalidation.

### Sprint 4: Architecture & Maintenance
- **Objective:** Decouple components for long-term growth.
- **Theme:** API Versioning and Dependency Injection.

### Sprint 5: Production Hardening
- **Objective:** Final verification and observability depth.
- **Theme:** Tracing, Chaos Testing, and Bundle Optimization.

---

## 4. Engineering Tasks

### Sprint 1: Critical Fixes

#### Task: Atomic Workspace Creation Transaction
- **Description:** Replace sequential `await` calls with a single atomic transaction to ensure a Workspace is never created without its initial "owner" membership.
- **Files:** `packages/db/src/repositories/workspace.repository.ts`
- **Steps:**
    1. Wrap `db.insert(workspaces)` and `db.insert(memberships)` in a `db.transaction()` block.
    2. Ensure the Neon HTTP driver is correctly configured for batch transactions.
- **AC:** If the membership insert fails, the workspace record is not created.
- **Complexity:** Medium

#### Task: Service-Level Permission Enforcement
- **Description:** Ensure that `updateMemberRole` and `removeMember` explicitly check if the performing user has the required seniority (e.g., must be an 'owner').
- **Files:** `apps/api/src/modules/workspaces/workspace.controller.ts`, `packages/db/src/repositories/workspace.repository.ts`
- **Steps:**
    1. Add a check in the controller to verify `c.get('workspaceRole') === 'owner'`.
    2. Throw `AppError(..., 403)` if unauthorized.
- **AC:** A 'member' cannot call the API to promote themselves to 'admin'.
- **Complexity:** Low

---

### Sprint 2: Stability & Performance

#### Task: Implement Idempotency Guard for Mutations
- **Description:** Add a generic middleware to handle `Idempotency-Key` headers for critical POST/PUT requests.
- **Files:** `apps/api/src/common/middlewares/idempotency.ts`, `wrangler.toml` (KV binding)
- **Steps:**
    1. Check for `Idempotency-Key` header.
    2. Lookup key in `CACHE_KV`. If exists, return cached response.
    3. If not, proceed to handler and store response in KV for 24 hours.
- **AC:** Repeated requests with the same key within 24h return the same status/body without re-executing logic.
- **Complexity:** Medium

#### Task: Database Indexing Overhaul
- **Description:** Add missing composite indexes for multi-tenant query patterns.
- **Files:** `packages/db/src/schema/audit.ts`, `packages/db/src/schema/usage.ts`
- **Steps:**
    1. Create index on `audit_logs(workspace_id, created_at)`.
    2. Create index on `usage(workspace_id, metric_name, timestamp)`.
- **AC:** Query plans for workspace logs show INDEX SCAN instead of SEQ SCAN.
- **Complexity:** Low

---

## 5. Data Consistency Strategy (Serverless Safe)

In an Edge environment with stateless database drivers, we prioritize **Eventual Consistency** and **Indempotent Mutations** over long-lived interactive transactions.

| Pattern | Application Area | Rationale |
| :--- | :--- | :--- |
| **Idempotency Keys** | Billing Create, Workspace Create, Invites | Prevents duplicate records on network retries in high-latency edge nodes. |
| **Non-Interactive Transactions** | User Signup, Plan Upgrades | Neon HTTP supports batching. Use for operations affecting exactly 2-3 tables. |
| **Transactional Outbox** | Email sending, Analytics sync | Write the event to a `outbox` table in the same DB transaction. A background worker (Jobs) processes high-reliability side effects. |
| **Optimistic Locking** | Usage Metering | Use `UPDATE ... WHERE current_value = X` to prevent race conditions during high-frequency increments. |

---

## 6. Edge Runtime Optimization

### Bundling & Cold Starts
1. **Tree-Shaking Enforcement:** Audit `packages/services` to ensure `import type` is used for all DTOs and interfaces to prevent evaluation of unused classes at runtime.
2. **Dynamic Imports for Heavy PDF/Image Logic:** If a route handles PDF generation (using `JobType.GENERATE_TICKET_PDF`), ensure the engine (like `jsPDF`) is only loaded in the `jobs-worker`.
3. **WaitUntil Optimization:** Move Axiom flushing and PostHog tracking *strictly* out of the request path using `ctx.waitUntil`.

---

## 7. Hybrid Transaction Strategy

For operations that **require complex multi-table orchestration** (e.g. bulk migrating resources between workspaces):

1. **Transaction Isolation:** Use a dedicated `transactional-worker` that connects via **Neon WebSocket Driver**.
2. **WebSocket Pooling:** This allows for stateful sessions and interactive Postgres transactions (`BEGIN` ... `COMMIT`).
3. **Internal RPC:** The `api` worker calls the `transactional-worker` via Service Bindings for these specific, infrequent operations.

---

## 8. Final Engineering Roadmap (Prioritized)

| Rank | Task | Impact | complexity | Effort |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | **Drizzle Transactions Refactor** | Vital Data Integrity | Medium | 3 days |
| **P0** | **RBAC Controller Enforcement** | Critical Security | Low | 1 day |
| **P1** | **Idempotency Keys (API-wide)** | Reliable Billing/UX | High | 4 days |
| **P1** | **Composite Indexing** | Query Performance | Low | 1 day |
| **P2** | **KV Cache Invalidation Logic** | Consistency | Medium | 2 days |
| **P2** | **API v1 Versioning** | Long-term Stability | Low | 1 day |
| **P3** | **Durable Objects Locking** | Concurrency safety | High | 5 days |

---

## 12. Final Verdict & Recommendation

The current architecture is **S-Tier for speed** but **A-Tier for reliability**. 

**Primary Target for next 48 hours:**  
Implement the **Transactional Outbox pattern** for auth emails and move all multi-row repository methods into **Drizzle Transactions**. This single move resolves 80% of the data integrity risks identified in the audit.
