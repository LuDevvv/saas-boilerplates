/**
 * Canonical action-string taxonomy for audit_logs rows.
 *
 * Keep this list in sync with ADR 0002 (docs/adr/0002-audit-logging-strategy.md).
 * AuditLogRepository.create only accepts members of AuditAction, so a typo
 * at the call site fails at typecheck rather than landing as a stray string
 * in production data.
 *
 * Convention: <domain>.<event_in_snake_case>. Domains today are auth,
 * workspace, billing, and admin; new domains can be added but should be
 * narrow (per-feature, not per-controller).
 */
export const AUDIT_ACTIONS = [
  // Auth + sessions + 2FA
  "auth.user_registered",
  "auth.login_succeeded",
  "auth.login_failed",
  "auth.logout",
  "auth.password_reset_requested",
  "auth.password_reset_completed",
  "auth.password_changed",
  "auth.two_factor_enabled",
  "auth.two_factor_disabled",
  "auth.session_revoked",
  "auth.session_revoked_all",
  "auth.api_key_created",
  "auth.api_key_revoked",
  "auth.account_closed",
  "auth.account_anonymized",
  // Workspace + memberships + invitations
  "workspace.member_invited",
  "workspace.member_joined",
  "workspace.member_role_changed",
  "workspace.member_removed",
  "workspace.workspace_closed",
  "workspace.workspace_hard_deleted",
  // Billing webhooks
  "billing.checkout_created",
  "billing.subscription_created",
  "billing.subscription_updated",
  "billing.subscription_canceled",
  // Billing user-initiated actions
  "billing.subscription_cancel_requested",
  "billing.plan_changed",
  // Admin
  "admin.user_role_changed",
  "admin.user_impersonated",
  // Storage / uploads
  "storage.upload_rejected",
  // Pre-Phase-3 events kept as taxonomy entries because their listeners
  // already wrote audit_logs rows under these names; renaming would
  // break analytics consumers downstream.
  "workspace.created",
  "workspace.member_added",
  "system.config_updated",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
