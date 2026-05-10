# ADR 0005 — Authentication Architecture

**Status:** Accepted  
**Date:** 2026-05-09

## Context

The platform needs a production-grade authentication system supporting:
- Email/password login
- OAuth (Google, GitHub)
- Two-factor authentication (TOTP)
- API key authentication for programmatic access
- Multi-device session management
- Token refresh without forcing re-login

## Decision

### Token strategy

We use **short-lived JWTs (15 min access token)** paired with **long-lived refresh tokens (30/90 days)** stored in the `sessions` table. This hybrid approach gives us:
- Stateless verification on every request (no DB hit per request)
- Revocability: invalidating a session row blocks all future refreshes
- Multi-device: each device/session gets its own refresh token row

Access tokens carry: `{ sub: userId, email, sessionId, type: "access" }`.
Refresh tokens carry: `{ sub: userId, email, sessionId, type: "refresh" }`.

### Session persistence

Sessions are stored in the `sessions` table (PostgreSQL, NOT Redis) so they:
- Survive Redis restarts
- Can be listed and revoked per-device by the user
- Participate in audit logging

### Service decomposition (Phase 4b)

`AuthService` delegates to four focused services:
- `TokenService` — JWT signing/verification, expiry policy
- `SessionService` — CRUD, reuse-by-userAgent, cursor-paginated list, revocation
- `PasswordService` — bcrypt (12 rounds), forgot/reset flows
- `OAuthService` — Google/GitHub OAuth, three-way resolution (link/create/login)

### In-place refresh (no ID rotation)

The refresh endpoint reissues tokens without rotating the session ID. Rationale: silent refresh on page load can fire multiple times from different tabs simultaneously; rotating the session ID on each refresh would cause race conditions where the second refresh invalidates the first. The audit trail records the userId, not the session ID, so security visibility is preserved.

### API key authentication

Workspace-scoped API keys are stored as `sha256(key)` (fast, one-way). On each request, the raw key is hashed and compared. A rate-limited cache stores valid hashes to avoid repeated DB hits.

### 2FA

TOTP using RFC 6238 (30-second windows). The TOTP secret is AES-256-GCM encrypted before storage using `ENCRYPTION_KEY`. The temp token flow (login → 2FA prompt → verify → full tokens) uses a short-lived JWT with `type: "2fa_pending"`.

## Consequences

- Access tokens cannot be revoked before expiry (15 min window acceptable for this use case).
- Session revocation only prevents future refresh; it does not invalidate the current access token.
- For immediate revocation (e.g. suspicious activity), the 15-min window must be tolerated or the access token TTL shortened.
