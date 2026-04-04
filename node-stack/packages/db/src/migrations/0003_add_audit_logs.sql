-- Audit logs table for tracking actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  actor_id TEXT,
  actor_type TEXT,
  entity TEXT,
  entity_id TEXT,
  payload JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
