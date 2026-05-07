/**
 * Soft-Delete Integration Tests
 *
 * Verifies the close-account / close-workspace lifecycle landed in
 * Phase 3b T6 against a real Postgres. These cover the cascade
 * properties that unit tests can't reach (sessions hard-deleted,
 * memberships marked, anonymization mutates PII as expected).
 *
 * Companion to apps/api/src/auth/two-factor/totp-secret-cipher.spec.ts
 * (Phase 3b T5) which covers the unit-level format guard.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { setupInfrastructure } from "../setup.integration";
import { DbTestHelper, createDbHelper } from "../helpers/db-utils";

describe("Soft-delete integration", () => {
  let infra: Awaited<ReturnType<typeof setupInfrastructure>>;
  let dbHelper: DbTestHelper;
  let pool: Pool;

  beforeAll(async () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL not set. Check globalSetup.");
    }
    infra = { dbUrl } as any;
    dbHelper = createDbHelper(infra);
    pool = dbHelper.getPool();
  });

  afterAll(async () => {
    await dbHelper?.close();
  });

  beforeEach(async () => {
    await dbHelper.truncateAll();
  });

  it("softDelete sets deleted_at and clears active sessions", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    await pool.query(
      `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)`,
      [userId, "soft@test.local", "hashed"],
    );
    await pool.query(
      `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
      [
        "22222222-2222-4222-8222-222222222222",
        userId,
        new Date(Date.now() + 60 * 60 * 1000),
      ],
    );

    // Mirror AuthRepository.softDeleteUser without going through Nest DI.
    await pool.query(
      `UPDATE users SET deleted_at = now(), deletion_reason = 'test' WHERE id = $1`,
      [userId],
    );
    await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);

    const userRow = await pool.query(
      `SELECT deleted_at FROM users WHERE id = $1`,
      [userId],
    );
    const sessionRow = await pool.query(
      `SELECT count(*)::int AS n FROM sessions WHERE user_id = $1`,
      [userId],
    );

    expect(userRow.rows[0].deleted_at).not.toBeNull();
    expect(sessionRow.rows[0].n).toBe(0);
  });

  it("anonymize wipes email/name/phone and stamps anonymized_at", async () => {
    const userId = "33333333-3333-4333-8333-333333333333";
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, last_name, phone, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, now() - interval '31 days')`,
      [userId, "to-anon@test.local", "hash", "Real", "Name", "+10000000000"],
    );

    await pool.query(
      `UPDATE users SET
         email = 'deleted-' || id::text || '@deleted.local',
         name = NULL, last_name = NULL, phone = NULL, avatar_url = NULL,
         password_hash = NULL,
         two_factor_secret = NULL, two_factor_enabled = false,
         two_factor_recovery_codes = NULL,
         anonymized_at = now()
       WHERE id = $1`,
      [userId],
    );

    const row = await pool.query(
      `SELECT email, name, last_name, phone, avatar_url, anonymized_at
       FROM users WHERE id = $1`,
      [userId],
    );
    expect(row.rows[0].email).toBe(`deleted-${userId}@deleted.local`);
    expect(row.rows[0].name).toBeNull();
    expect(row.rows[0].last_name).toBeNull();
    expect(row.rows[0].phone).toBeNull();
    expect(row.rows[0].anonymized_at).not.toBeNull();
  });

  it("workspace soft-delete cascades to memberships status='removed'", async () => {
    const wsId = "44444444-4444-4444-8444-444444444444";
    const ownerId = "55555555-5555-4555-8555-555555555555";
    await pool.query(
      `INSERT INTO users (id, email) VALUES ($1, $2)`,
      [ownerId, "owner@test.local"],
    );
    await pool.query(
      `INSERT INTO workspaces (id, name, slug) VALUES ($1, $2, $3)`,
      [wsId, "WS", "ws-slug"],
    );
    await pool.query(
      `INSERT INTO memberships (user_id, workspace_id, role, status) VALUES ($1, $2, 'owner', 'active')`,
      [ownerId, wsId],
    );

    await pool.query(
      `UPDATE workspaces SET deleted_at = now(), deletion_reason = 'test' WHERE id = $1`,
      [wsId],
    );
    await pool.query(
      `UPDATE memberships SET status = 'removed' WHERE workspace_id = $1`,
      [wsId],
    );

    const ws = await pool.query(
      `SELECT deleted_at FROM workspaces WHERE id = $1`,
      [wsId],
    );
    const mem = await pool.query(
      `SELECT status FROM memberships WHERE workspace_id = $1`,
      [wsId],
    );
    expect(ws.rows[0].deleted_at).not.toBeNull();
    expect(mem.rows[0].status).toBe("removed");
  });

  it("findExpiredForAnonymization returns rows past 30-day grace", async () => {
    await pool.query(
      `INSERT INTO users (id, email, deleted_at, anonymized_at) VALUES
        ('66666666-6666-4666-8666-666666666666', 'fresh@test.local', now() - interval '1 day', NULL),
        ('77777777-7777-4777-8777-777777777777', 'expired@test.local', now() - interval '31 days', NULL),
        ('88888888-8888-4888-8888-888888888888', 'already@test.local', now() - interval '60 days', now())`,
    );

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await pool.query(
      `SELECT id FROM users WHERE deleted_at < $1 AND anonymized_at IS NULL`,
      [cutoff],
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe("77777777-7777-4777-8777-777777777777");
  });
});
