# 1. Row-Level Security via tenant/system tx wrappers

Date: 2026-05-07
Status: Accepted

## Context

The audit (§2.3) flagged the previous RLS state as "the worst mixed
option": migration `0012_enable_rls.sql` enabled RLS on nine
multi-tenant tables (`workspaces`, `memberships`, `audit_logs`,
`api_keys`, `tasks`, `files`, `outbox`, `customers`,
`subscriptions`), but the GUC `app.current_workspace_id` was only
set inside an unstructured `withTransaction` shim that read the
workspace id from `RequestContextService` if it happened to be
populated. Reads outside the wrapper either fail-closed (return 0
rows) or — depending on order — leak across tenants. Service-layer
code mixed both patterns and had no static signal of which path was
RLS-safe.

## Decision

Two explicit wrappers in `packages/db/src/index.ts`:

- `withTenantTx(workspaceId, cb, db)` — opens a transaction, sets
  the GUC to the validated UUID via parameterized `set_config`,
  runs `cb(tx)`. Used by every request-scoped path that touches an
  RLS-protected table.
- `withSystemTx(cb, db)` — opens a transaction, sets the GUC to the
  literal sentinel `system`. Migration `0016_rls_system_bypass`
  rewrites every per-table policy to `USING (workspace_id = guc OR
  guc = 'system')`. Used by crons, admin tooling, and cross-tenant
  flows (signup, password reset, invitation accept, etc.).

`UUID_REGEX` validation in `withTenantTx` prevents tenant code from
impersonating the `system` sentinel.

Repositories on RLS-protected tables accept `tx?: Tx` on every
method. Services pass `tx` through from their wrapper block. The
existing `withTransaction` shim is kept only as a deprecated
back-compat label.

## Consequences

- A direct `this.db.query.workspaces.findMany()` outside any wrapper
  returns 0 rows on a freshly-migrated DB. Defense-in-depth: the
  same property holds even if a future caller forgets the wrapper.
- Cross-tenant smoke confirmed in Phase 2.5 (close-out report): 11
  probes, zero leaks; 403 from `WorkspaceGuard` for path/header
  mismatches; per-user filter holds for cross-workspace audit logs
  and workspace listing.
- New repository methods MUST follow the `tx?: Tx` shape; new
  service code MUST go through one of the wrappers. Enforced by
  code review and pre-commit typecheck (the wrappers' parameter
  types make the call site visible).
- Trade-off: `withSystemTx` is broader than necessary for
  invitation-accept-style cross-tenant flows. The `userId` /
  `email` / `token` filter inside the wrapper is the actual
  security boundary in those cases. Acceptable for now; a per-flow
  policy refinement is Phase 4 territory if it becomes load-bearing.

## References

- Phase 2 Task 4a: commit `033ef17`.
- Phase 2 Task 4b: commit `9fcbba5`.
- Phase 2.5 commits 1/2 + 2/2 + 3/2: `e291751`, `244588f`, `b98abaa`.
- Phase 2.5 close-out: commit `84a89fc` (transaction shim removed).
