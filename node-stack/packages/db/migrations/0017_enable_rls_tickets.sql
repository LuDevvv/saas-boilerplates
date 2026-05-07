-- Enable RLS on the tickets table to match the multi-tenant pattern
-- established in 0012/0016 for the other 9 workspace-scoped tables.
-- Tickets carry workspace_id and are accessed exclusively from request
-- paths that already pass through withTenantTx (Phase 2.5); enabling
-- RLS here is the fail-closed defense layer if a future caller forgets.

ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "ticket_isolation_policy" ON "tickets"
    USING (
        workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid
        OR current_setting('app.current_workspace_id', true) = 'system'
    );
