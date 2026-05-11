# 2. Audit logging strategy

Date: 2026-05-07
Status: Accepted

## Context

The audit doc flagged that `audit_logs` schema and
`AuditLogRepository` existed but no domain code wrote to them; the
existing `AuditInterceptor` captured raw HTTP requests, which is
insufficient for SOC2-equivalent traceability of the security
events (logins, password resets, role changes, billing changes,
impersonation).

## Decision

Each security-sensitive domain event writes a row to `audit_logs`
inside the same transaction as the originating write. Pattern:

```ts
await withTenantTx(workspaceId, async (tx) => {
  await this.repo.method(args, tx);
  await this.auditLog.create({
    workspaceId,
    userId: actorId,
    action: 'taxonomy.action_string',
    entityType: 'user' | 'session' | 'subscription' | ...,
    entityId: targetId,
    metadata: { /* non-secret context */ },
    ipAddress, userAgent,
  }, tx);
}, this.db);
```

For events that come from outside the request-scoped path
(EventEmitter listeners in `AuditService` for legacy `audit.log`
fan-out), the listener wraps in `withSystemTx`.

### Action taxonomy

The canonical list lives at `packages/db/src/audit-actions.ts` as the
`AUDIT_ACTIONS` const tuple. `AuditAction` is its derived union type
and is the strict argument type of `AuditLogRepository.create`. Adding
a new action means appending it there; using a string that's not in the
union fails the typecheck at the call site (Phase 3b Task 4).

The current list, grouped by domain:

```
// auth
auth.user_registered, auth.login_succeeded, auth.login_failed,
auth.logout, auth.password_reset_requested, auth.password_reset_completed,
auth.password_changed, auth.two_factor_enabled, auth.two_factor_disabled,
auth.session_revoked, auth.session_revoked_all,
auth.api_key_created, auth.api_key_revoked,
auth.account_closed, auth.account_anonymized,
// workspace
workspace.created, workspace.member_invited, workspace.member_joined,
workspace.member_added, workspace.member_role_changed, workspace.member_removed,
workspace.workspace_closed, workspace.workspace_hard_deleted,
// billing
billing.subscription_created, billing.subscription_updated,
billing.subscription_canceled,
// storage
storage.upload_rejected, storage.file_deleted,
// admin
admin.user_role_changed, admin.user_impersonated,
// system
system.config_updated
```

`AuditService.handleAuditLog` (the event-emitter fan-in) keeps a
permissive `string` payload at the boundary so the AuditInterceptor's
HTTP-derived `http.{method}.{path}` strings still flow through; it
runs a runtime guard against `AUDIT_ACTIONS` and warns when a
non-taxonomy string lands. Direct `auditLog.create({...})` calls in
domain services bypass that bridge and benefit from full type
checking.

### Redaction

`AuditService.sanitize` recursively redacts keys containing
`password`, `token`, `secret`, `apiKey`, or `credential`. Direct
`auditLog.create` writes that build their own metadata MUST
explicitly avoid these fields; the redactor only runs on the
`audit.log` event path.

Never include: plaintext passwords, password hashes, raw 2FA
secrets, refresh tokens, access tokens, raw API keys, API key
hashes, raw session IDs (use a prefix or hash if traceability is
needed), full credit card numbers.

## Consequences

- Audit is atomic with the operation: a half-failed transaction
  cannot leave an orphan audit row.
- The taxonomy is a hard contract — changing an action string is a
  breaking change for downstream analytics consumers.
- Webhook events (Polar) record `userId: null` because the actor is
  not human. Cron events record `userId: null` for the same reason.
- Future event types (Phase 4 candidates): `auth.account_closed`,
  `auth.account_hard_deleted`, `workspace.workspace_closed`,
  `workspace.workspace_hard_deleted` (Phase 3 soft-delete forward
  reference).

## References

- Phase 2 Task 5a: commit `018878d`.
- Phase 2 Task 5b: commit `901f64f`.
- Phase 3 Task 4: commits `360df26`, `c5ceb78`.
