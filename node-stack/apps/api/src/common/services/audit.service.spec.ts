import { describe, expect, it } from "vitest";

import { AUDIT_ACTIONS, type AuditAction } from "../../../../../packages/db/src/audit-actions.js";

// AuditService.handleAuditLog is mostly a withSystemTx wrapper around
// AuditLogRepository.create + a sanitize() pass over metadata; it
// requires a real Database token to instantiate. We isolate the
// pure-function pieces here:
//   - sanitize() over sensitive keys
//   - AUDIT_ACTIONS taxonomy invariants
// End-to-end audit_logs writes are covered in the integration suite
// (Phase 3c).

// Inlined copy of AuditService.sanitize for unit testing without
// pulling the full NestJS DI graph. Kept literal to the source.
const SENSITIVE_KEYS = ["password", "token", "secret", "apiKey", "credential"];

function sanitize(data: any): any {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item));
  }
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((sk) =>
      key.toLowerCase().includes(sk.toLowerCase()),
    );
    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

describe("AuditService.sanitize", () => {
  it("redacts top-level sensitive keys", () => {
    const out = sanitize({
      email: "user@test.local",
      password: "hunter2",
      token: "eyJ...",
      apiKey: "sk_live_...",
      secret: "totp-seed",
    });
    expect(out.email).toBe("user@test.local");
    expect(out.password).toBe("[REDACTED]");
    expect(out.token).toBe("[REDACTED]");
    expect(out.apiKey).toBe("[REDACTED]");
    expect(out.secret).toBe("[REDACTED]");
  });

  it("recurses into nested objects", () => {
    const out = sanitize({
      user: { id: "abc", passwordHash: "$2b$..." },
      meta: { credentialId: "x" },
    });
    expect(out.user.id).toBe("abc");
    expect(out.user.passwordHash).toBe("[REDACTED]");
    expect(out.meta.credentialId).toBe("[REDACTED]");
  });

  it("preserves arrays and primitives", () => {
    const out = sanitize({ tags: ["a", "b"], count: 3, ok: true });
    expect(out.tags).toEqual(["a", "b"]);
    expect(out.count).toBe(3);
    expect(out.ok).toBe(true);
  });

  it("matches case-insensitively", () => {
    const out = sanitize({ PASSWORD: "x", User_Token: "y", ApiKEY: "z" });
    expect(out.PASSWORD).toBe("[REDACTED]");
    expect(out.User_Token).toBe("[REDACTED]");
    expect(out.ApiKEY).toBe("[REDACTED]");
  });

  it("leaves null and undefined alone", () => {
    expect(sanitize(null)).toBeNull();
    expect(sanitize(undefined)).toBeUndefined();
    expect(sanitize({ x: null })).toEqual({ x: null });
  });
});

describe("AUDIT_ACTIONS taxonomy", () => {
  it("is non-empty", () => {
    expect(AUDIT_ACTIONS.length).toBeGreaterThan(0);
  });

  it("contains every documented domain prefix", () => {
    const prefixes = new Set(AUDIT_ACTIONS.map((a) => a.split(".")[0]));
    expect(prefixes.has("auth")).toBe(true);
    expect(prefixes.has("workspace")).toBe(true);
    expect(prefixes.has("billing")).toBe(true);
    expect(prefixes.has("admin")).toBe(true);
  });

  it("has no duplicate entries", () => {
    const set = new Set(AUDIT_ACTIONS);
    expect(set.size).toBe(AUDIT_ACTIONS.length);
  });

  it("uses snake_case event names (no hyphens)", () => {
    for (const action of AUDIT_ACTIONS) {
      expect(action).not.toMatch(/-/);
    }
  });

  it("AuditAction type narrows to the union", () => {
    // Compile-time check; the const tuple's `as const` plus the
    // `(typeof AUDIT_ACTIONS)[number]` derivation gives us this.
    const a: AuditAction = "auth.login_succeeded";
    expect(AUDIT_ACTIONS).toContain(a);
  });
});
