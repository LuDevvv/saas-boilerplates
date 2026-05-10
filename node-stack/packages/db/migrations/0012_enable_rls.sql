-- Enable RLS on core tables
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outbox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;

-- Create policies for workspaces
-- A workspace is visible if its ID matches the current context
CREATE POLICY workspace_isolation_policy ON "workspaces"
    USING (id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

-- Create policies for other tables
CREATE POLICY membership_isolation_policy ON "memberships"
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY audit_log_isolation_policy ON "audit_logs"
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY api_key_isolation_policy ON "api_keys"
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY task_isolation_policy ON "tasks"
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY file_isolation_policy ON "files"
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY outbox_isolation_policy ON "outbox"
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY customer_isolation_policy ON "customers"
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY subscription_isolation_policy ON "subscriptions"
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

-- Note: We use NULLIF(..., '') to handle cases where the setting might be an empty string
-- and current_setting(..., true) to return NULL instead of throwing if the setting is missing.
-- If the setting is NULL, the comparison fails and access is denied (fail-closed).
