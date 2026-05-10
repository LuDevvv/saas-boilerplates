# 3. Soft-delete with 30-day grace period

Date: 2026-05-07
Status: Accepted (forward-looking)

## Context

Audit §2.3 flagged hard-delete on `users` and `workspaces` as a
compliance risk: GDPR right-to-erasure can be honored on a
multi-day grace, and an accidentally-destroyed workspace has no
recovery path. The schema, services, and cron required to fix this
are sized as Phase 3 Task 5 in the directive.

## Decision

Soft-delete pattern, applied initially to `users` and `workspaces`:

- Schema additions on each table:
  - `deleted_at: timestamp` (nullable; non-null = soft-deleted)
  - `deleted_by: uuid` (the user/admin that initiated)
  - `deletion_reason: text`
- Partial index `WHERE deleted_at IS NOT NULL` for the cron's
  `findExpiredAccounts` query.
- Default repository lookups (`findUserByEmail`, `findUserById`,
  `findWorkspaceById`, etc.) exclude soft-deleted rows. An explicit
  `{ includeDeleted: true }` flag is required to opt-in.
- `softDelete(id, deletedBy, reason, tx?)` cascades:
  - Users: hard-delete sessions (revoke tokens immediately), revoke
    api_keys, mark memberships `status='removed'`.
  - Workspaces: mark memberships `status='removed'`, revoke
    api_keys, soft-delete invitations. Does NOT cascade to users.
- `restore(id, tx?)` reverses the soft-delete; only valid within the
  30-day window (caller validates).
- `hardDelete(id, tx?)` permanently removes; only invoked by the
  daily cron after the grace expires.

`MaintenanceService.hardDeleteExpiredAccounts` runs daily under
`withSystemTx` and `withRedisLock`, hard-deleting rows whose
`deleted_at` is older than 30 days.

### Endpoints

- `DELETE /api/v1/auth/me` — re-auth required (password in body).
- `DELETE /api/v1/workspaces/:id` — `Roles(Role.OWNER)` only.

### Audit events

`auth.account_closed`, `auth.account_hard_deleted`,
`workspace.workspace_closed`, `workspace.workspace_hard_deleted`.

## Consequences

- Soft-deleted user cannot log in (existing sessions are revoked at
  soft-delete time).
- Soft-deleted workspace's data is invisible via list endpoints but
  remains in DB until the cron cleans it up.
- 30-day grace is fixed in code today; if compliance changes
  require a different grace, it's a one-line constant change.
- New tables that should be soft-deletable will need their own
  schema columns + repository pattern follow-up; this ADR
  intentionally scopes to users and workspaces.

## References

- Phase 3 Task 5 (in progress / Phase 3 follow-up). When commits
  land, link them here.
