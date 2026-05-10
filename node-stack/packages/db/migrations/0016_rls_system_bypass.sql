-- Replace the per-table RLS isolation policies introduced in 0012 with
-- variants that also accept the literal sentinel 'system' as the GUC
-- value. Crons, admin tooling, and other cross-tenant jobs run under
-- withSystemTx() (packages/db/src/index.ts), which sets the GUC to
-- 'system' for the duration of the transaction.
--
-- Reverse direction (manual; drizzle migrations are forward-only):
--   For each table, DROP POLICY ... and recreate the original policy
--   without the OR clause. The 0012 file is the reference for that
--   shape.

DROP POLICY IF EXISTS "workspace_isolation_policy" ON "workspaces";--> statement-breakpoint
CREATE POLICY "workspace_isolation_policy" ON "workspaces"
    USING (
        id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );--> statement-breakpoint

DROP POLICY IF EXISTS "membership_isolation_policy" ON "memberships";--> statement-breakpoint
CREATE POLICY "membership_isolation_policy" ON "memberships"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );--> statement-breakpoint

DROP POLICY IF EXISTS "audit_log_isolation_policy" ON "audit_logs";--> statement-breakpoint
CREATE POLICY "audit_log_isolation_policy" ON "audit_logs"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );--> statement-breakpoint

DROP POLICY IF EXISTS "api_key_isolation_policy" ON "api_keys";--> statement-breakpoint
CREATE POLICY "api_key_isolation_policy" ON "api_keys"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );--> statement-breakpoint

DROP POLICY IF EXISTS "task_isolation_policy" ON "tasks";--> statement-breakpoint
CREATE POLICY "task_isolation_policy" ON "tasks"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );--> statement-breakpoint

DROP POLICY IF EXISTS "file_isolation_policy" ON "files";--> statement-breakpoint
CREATE POLICY "file_isolation_policy" ON "files"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );--> statement-breakpoint

DROP POLICY IF EXISTS "outbox_isolation_policy" ON "outbox";--> statement-breakpoint
CREATE POLICY "outbox_isolation_policy" ON "outbox"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );--> statement-breakpoint

DROP POLICY IF EXISTS "customer_isolation_policy" ON "customers";--> statement-breakpoint
CREATE POLICY "customer_isolation_policy" ON "customers"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );--> statement-breakpoint

DROP POLICY IF EXISTS "subscription_isolation_policy" ON "subscriptions";--> statement-breakpoint
CREATE POLICY "subscription_isolation_policy" ON "subscriptions"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );
