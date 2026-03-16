-- Seed basic permissions
INSERT INTO "permissions" ("id", "name", "description") VALUES
('workspace:manage', 'Manage Workspace', 'Full control over workspace settings and deletion'),
('workspace:invite', 'Invite Members', 'Ability to invite new members to the workspace'),
('workspace:read', 'Read Workspace', 'Ability to view workspace details and member list'),
('billing:manage', 'Manage Billing', 'Ability to update plans, payment methods, and view invoices'),
('billing:read', 'Read Billing', 'Ability to view current subscription status'),
('tasks:read', 'Read Tasks', 'Ability to view workspace tasks'),
('tasks:write', 'Write Tasks', 'Ability to create and edit tasks'),
('tasks:delete', 'Delete Tasks', 'Ability to remove tasks')
ON CONFLICT (id) DO NOTHING;

-- Map permissions to Roles (Owner, Admin, Member)
-- OWNER permissions
INSERT INTO "role_permissions" ("role", "permission_id")
SELECT 'owner', id FROM "permissions"
ON CONFLICT DO NOTHING;

-- ADMIN permissions (Most things except workspace:manage)
INSERT INTO "role_permissions" ("role", "permission_id")
SELECT 'admin', id FROM "permissions" WHERE id != 'workspace:manage'
ON CONFLICT DO NOTHING;

-- MEMBER permissions (Basic usage)
INSERT INTO "role_permissions" ("role", "permission_id")
VALUES 
('member', 'workspace:read'),
('member', 'billing:read'),
('member', 'tasks:read'),
('member', 'tasks:write')
ON CONFLICT DO NOTHING;
