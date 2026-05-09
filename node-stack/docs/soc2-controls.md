# SOC 2 Security Controls Mapping

> Maps SOC 2 Type II Trust Service Criteria (TSC) to implemented controls in node-stack.
> Intended for security reviewers and compliance teams.
> **Last updated:** 2026-05-09

---

## CC1 — Control Environment

| Sub-criterion | Implementation |
|--------------|----------------|
| CC1.1 — COSO principles | Engineering guardrails in `CLAUDE.md`; ENGINEERING_GUIDE.md for all contributors |
| CC1.2 — Board oversight | Out of scope (startup phase); document when a security committee is formed |
| CC1.3 — Organizational structure | Role-based access: `user`, `admin`, `super_admin` enforced at DB + API level |
| CC1.4 — Competence | ADR process documents architectural decisions; pre-commit TypeScript checks |
| CC1.5 — Accountability | Audit log for every security event (see CC6.2); session attribution per user |

---

## CC2 — Communication and Information

| Sub-criterion | Implementation |
|--------------|----------------|
| CC2.1 — Information quality | Zod validation on all API inputs; strict TypeScript (no `any`, `noUncheckedIndexedAccess`) |
| CC2.2 — Internal communication | ADRs, ENGINEERING_GUIDE.md, inline code comments for non-obvious invariants |
| CC2.3 — External communication | HTTP responses never leak stack traces (`HttpExceptionFilter` masks internals) |

---

## CC3 — Risk Assessment

| Sub-criterion | Implementation |
|--------------|----------------|
| CC3.1 — Risk identification | Security ADRs (0001-0009); `docs/technical-audit-2026-05-07.md` |
| CC3.2 — Risk analysis | Threat model: RLS bypass, tenant data leakage, injection, CSRF addressed |
| CC3.3 — Risk response | RLS fail-closed design (0 rows if no GUC); HMAC webhook verification |
| CC3.4 — Change management | CI typecheck + lint gates; PR review required on `main` |

---

## CC6 — Logical and Physical Access Controls

| Sub-criterion | Implementation |
|--------------|----------------|
| CC6.1 — Access provisioning | Workspace memberships with roles (owner/admin/member); JWT with short 15-min expiry |
| CC6.2 — Access removal | Session revocation endpoint; `auth.session_revoked` + `auth.session_revoked_all` audit events |
| CC6.3 — Authentication | Bcrypt 12 rounds; optional TOTP 2FA; OAuth (Google, GitHub); API keys scoped to workspace |
| CC6.6 — Network access | Helmet CSP with per-request nonces; CORS restricted to configured origins; `trust proxy` set |
| CC6.7 — Transmission encryption | HTTPS enforced in production; `sameSite: strict` cookies; `secure` flag on prod |
| CC6.8 — Malware prevention | Content-type validation (magic bytes); file size limits; input validation via Zod |

---

## CC7 — System Operations

| Sub-criterion | Implementation |
|--------------|----------------|
| CC7.1 — Vulnerability detection | Secret scanning (Gitleaks in CI); `pnpm audit` available |
| CC7.2 — Anomaly detection | `AuditInterceptor` logs every mutating HTTP request; `no-console` rule enforces structured logging |
| CC7.3 — Incident evaluation | `HttpExceptionFilter` captures all errors; Sentry integration in `tracing.ts` |
| CC7.4 — Incident response | Graceful shutdown handlers; `SIGTERM`/`SIGINT` with 10s timeout for in-flight requests |
| CC7.5 — Disaster recovery | Postgres soft-delete + 30-day hard-delete window; outbox pattern for reliable event delivery |

---

## CC8 — Change Management

| Sub-criterion | Implementation |
|--------------|----------------|
| CC8.1 — Change process | Git-flow (`develop` → `main`); pre-commit TypeScript + lint checks |
| CC8.1a — Authorization | PR review; `CLAUDE.md` contributor guardrails |
| CC8.1b — Testing | Unit tests (Vitest); E2E tests (Playwright); integration tests with real DB |
| CC8.1c — Configuration management | `validateEnv()` Zod schema enforced at boot; `.env.example` documents all required vars |

---

## CC9 — Risk Mitigation

| Sub-criterion | Implementation |
|--------------|----------------|
| CC9.1 — Risk mitigation activities | Rate limiting (`ThrottlerGuard`); idempotency keys; circuit breaker for billing provider |
| CC9.2 — Vendor management | Polar SDK wrapped behind `BillingAdapter`; AI providers behind `AiAdapter` |

---

## A1 — Availability

| Sub-criterion | Implementation |
|--------------|----------------|
| A1.1 — Capacity planning | `metrics/metrics.service.ts` exposes Prometheus metrics for CPU/memory/queue depth |
| A1.2 — Monitoring | Health endpoints (`/health`, `/health/live`, `/health/ready`) for load balancer probes |
| A1.3 — Backup/recovery | DB backups responsibility of hosting provider; outbox pattern ensures no event loss |

---

## PI1 — Processing Integrity

| Sub-criterion | Implementation |
|--------------|----------------|
| PI1.1 — Data processing | Zod schema validation on every input; DB transactions for multi-step operations |
| PI1.2 — Completeness | Outbox + BullMQ guarantee at-least-once delivery; retry logic in `WebhookDispatcher` |

---

## Gaps and open items

| Gap | Priority | Notes |
|-----|----------|-------|
| Penetration testing | High | Schedule annual pentest |
| DSAR (data subject access request) flow | Medium | Portability endpoint exists; need formal DSAR process |
| Encryption at rest | Medium | Depends on hosting provider; document if self-hosting |
| Vendor security assessments | Medium | Polar, AWS S3, Redis provider |
| Access review cadence | Low | Quarterly review of admin/super_admin accounts |
