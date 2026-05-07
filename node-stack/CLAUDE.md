# node-stack — engineering guardrails

This file lists the load-bearing conventions a contributor (human or
agent) needs to know to avoid breaking security, RLS, or audit
properties of the codebase. It is intentionally short. For detailed
rationale see `docs/adr/`.

## Database / RLS

- Every read or write to an RLS-protected table (workspaces,
  memberships, audit_logs, api_keys, tasks, files, outbox, customers,
  subscriptions) MUST go through one of the wrappers in
  `packages/db/src/index.ts`:
  - `withTenantTx(workspaceId, cb, db)` — request-scoped, RLS pinned
    to that workspace.
  - `withSystemTx(cb, db)` — cron / admin / cross-tenant work, RLS
    bypass via the `system` GUC sentinel.
- Never query an RLS-protected table via `this.db.query.*` outside a
  wrapper. The query will return 0 rows on a freshly-migrated DB
  (fail-closed), or — once GUC bleeds across calls — leak across
  tenants.
- Repositories on RLS-protected tables accept `tx?: Tx` on every
  method. New methods MUST follow that shape.

## Audit logging

- All security-sensitive domain events write a row to `audit_logs`
  inside the same transaction as the originating write. Pattern:
  `await this.auditLog.create({ ... }, tx);` inside the `withTenantTx`
  / `withSystemTx` block.
- Use the action-string taxonomy in ADR 0002. Never invent a new
  action name without adding it to that list.
- Never put `password`, `passwordHash`, `*Secret`, `*Token`,
  `apiKey`, `apiKeyHash`, raw `sessionId`, or full credit-card
  numbers in metadata. The `AuditService` redactor handles common
  cases; new fields that look sensitive must go through the
  redactor or be redacted at the call site.

## Soft-delete

- `users` and `workspaces` are soft-deleted (`deleted_at` column).
- Default repo lookups exclude soft-deleted rows. Pass
  `{ includeDeleted: true }` only with a clear reason.
- Cron `MaintenanceService.hardDeleteExpiredAccounts` permanently
  removes rows after 30 days. Do not call hard-delete paths from
  request flows.

## Migrations

- The Drizzle migration journal at
  `packages/db/migrations/meta/_journal.json` is missing snapshot
  files for migrations 0012–0016 (hand-written under sandbox
  constraints during Phases 1–2). `drizzle-kit generate` from a
  non-TTY environment fails on the enums-resolver prompt; the
  generated diff against current schema is therefore unreliable
  until snapshots are reconciled.
- **Action required (maintainer, local TTY)** before adding any new
  schema-derived migration:
  1. From a clean checkout: `cd node-stack/packages/db`
  2. Run `pnpm db:generate` interactively. Drizzle will prompt for
     enum / column rename resolution. Pick the literal "create"
     option for any prompt about pre-existing columns it can't
     match (rememberMe, lastName, phone, files.user_id nullability,
     RLS policy duplications); they already exist in the SQL files.
  3. The output should be the missing snapshot JSON files in
     `packages/db/migrations/meta/0012_snapshot.json` through
     `0016_snapshot.json`.
  4. If the run also writes a new SQL migration, delete it (we
     already have the SQL hand-written) but keep the snapshots.
  5. Commit only the `meta/00*_snapshot.json` files plus an updated
     `_journal.json` under one commit:
     `fix(db): reconcile drizzle migration snapshots for 0012–0016`.
- Until then, schema changes that need new migrations must be
  hand-written following the pattern in 0013–0016, with a journal
  entry and SQL file but no snapshot.

## Pre-commit hook

- `node-stack/.husky/pre-commit` runs `tsc -b --noEmit` over
  `apps/api` and `apps/worker`. It bumps `NODE_OPTIONS` to
  `--max-old-space-size=4096` to avoid OOM on the cross-package
  graph. Do not bypass with `--no-verify` unless the hook itself
  is broken.

## Commits

- Commit messages in English. AUTH_ERRORS strings stay Spanish.
- One topic per commit. Use the existing prefix style: `feat(api)`,
  `fix(db)`, `chore(repo)`, etc.
- Never `git add -A` or `git add .`. Always pass explicit pathspecs
  so other agents' WIP doesn't accidentally ship.

## Phase ledger

- Phase 1 (security hardening): commits ee4b3f5..8b920d2.
- Phase 2 (RLS + audit infra + CI): commits 84a89fc inclusive of
  Phase 2.5 (`refactor(api): route RLS-table reads...`).
- Phase 3 (sustainability) lives on top of `develop` and may
  introduce soft-delete, snapshot reconciliation, and tests.
