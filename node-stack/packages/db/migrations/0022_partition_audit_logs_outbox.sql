-- Migration 0022 — Range partitioning for audit_logs and outbox
--
-- IMPORTANT: This migration converts audit_logs and outbox to partitioned
-- tables. It must be run during a maintenance window on an existing database.
-- On a fresh database it is safe to run immediately.
--
-- Strategy:
--   1. Rename current tables to *_old
--   2. Create new partitioned parent tables (no data yet)
--   3. Create default + current-month partitions
--   4. Copy data from *_old into the new partitioned tables
--   5. Drop *_old tables
--
-- For large production tables: use pg_partman or manual ATTACH PARTITION
-- for historical data instead of a bulk INSERT — this migration uses a
-- simple INSERT which may lock for minutes on large tables.
--
-- breakpoints: true

-- ─── audit_logs ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Skip if already partitioned (idempotent re-run safety)
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'audit_logs'
      AND n.nspname = 'public'
      AND c.relkind = 'p'
  ) THEN
    RAISE NOTICE 'audit_logs is already partitioned — skipping.';
    RETURN;
  END IF;

  -- 1. Rename existing table
  ALTER TABLE audit_logs RENAME TO audit_logs_old;

  -- 2. Create partitioned parent (LIKE copies column defs + constraints)
  CREATE TABLE audit_logs (
    LIKE audit_logs_old INCLUDING ALL
  ) PARTITION BY RANGE (created_at);

  -- 3. Default partition catches rows outside explicit month partitions
  CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

  -- 4. Current-month partition
  CREATE TABLE audit_logs_y2026m05 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

  -- 5. Migrate data
  INSERT INTO audit_logs SELECT * FROM audit_logs_old;

  -- 6. Drop old table
  DROP TABLE audit_logs_old;

  RAISE NOTICE 'audit_logs partitioned successfully.';
END;
$$;

-- ─── outbox ─────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'outbox'
      AND n.nspname = 'public'
      AND c.relkind = 'p'
  ) THEN
    RAISE NOTICE 'outbox is already partitioned — skipping.';
    RETURN;
  END IF;

  ALTER TABLE outbox RENAME TO outbox_old;

  CREATE TABLE outbox (
    LIKE outbox_old INCLUDING ALL
  ) PARTITION BY RANGE (created_at);

  CREATE TABLE outbox_default PARTITION OF outbox DEFAULT;

  CREATE TABLE outbox_y2026m05 PARTITION OF outbox
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

  INSERT INTO outbox SELECT * FROM outbox_old;

  DROP TABLE outbox_old;

  RAISE NOTICE 'outbox partitioned successfully.';
END;
$$;

-- ─── Helper: create next-month partition (run monthly via pg_partman or cron)
--
-- Example for 2026-06:
--   CREATE TABLE audit_logs_y2026m06 PARTITION OF audit_logs
--     FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
--   CREATE TABLE outbox_y2026m06 PARTITION OF outbox
--     FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
--
-- Automate with pg_partman: SELECT partman.create_parent(
--   'public.audit_logs', 'created_at', 'native', 'monthly');
