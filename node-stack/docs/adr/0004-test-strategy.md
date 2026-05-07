# 4. Test strategy and CI gates

Date: 2026-05-07
Status: Accepted

## Context

Audit §5 flagged zero test coverage as the single biggest DX gap.
Phase 2 added GitHub Actions CI (lint / typecheck / build / test
jobs) but the `test` job was kept `continue-on-error: true` because
no real test suites existed. Phase 3 Task 6 establishes the
baseline.

## Decision

### Tooling

- `vitest@^1.x` standardized across all packages that test.
  - `apps/api`: unit + integration via existing
    `vitest.config.ts` + `vitest.config.integration.ts`.
  - `packages/services` and any new tested package gets a minimal
    `vitest.config.ts` with `environment: 'node'`.
- Integration tests that need a live DB use the same Postgres +
  Redis service-container pattern as the CI `test` job.

### Coverage targets (Phase 3 baseline)

Cover the highest-risk paths first; not exhaustive:

- `EncryptionService` / `EncryptionUtils` — round-trip + tamper
  detection on iv / authTag / ciphertext.
- `TotpSecretCipher` — strict format check, legacy plaintext seed
  rejection.
- `withTenantTx` / `withSystemTx` — integration test against a
  real Postgres confirming RLS isolation across simulated tenants
  and the system bypass.
- JWT sign / verify — separate access vs refresh secrets, expiry,
  tampered payload.
- `AuditService` — redaction over sensitive keys, row shape on
  successful insert.
- Soft-delete (when Task 5 lands) — softDelete, restore,
  hardDelete, login rejection of soft-deleted users.

Total target: ~30–40 tests at the Phase 3 baseline. Edge-case
exhaustion is Phase 4 territory.

### CI gates

After Phase 3 Task 6 lands:

- Lint: `--max-warnings 0`. `continue-on-error` removed.
- Typecheck: already mandatory; gets `NODE_OPTIONS=--max-old-space-size=6144`
  to avoid OOM on cross-package graph (Phase 3 Task 2).
- Build: already mandatory; same heap.
- Test: `continue-on-error` removed; suite runs against
  postgres + redis service containers.

Pre-commit hook stays typecheck-only (fast feedback);
`pnpm test` and full CI run the suites.

## Consequences

- New PRs cannot land if any of the listed paths regress.
- The first contributor to add a feature in a covered domain MUST
  add at least one test for it; no test-as-afterthought commits.
- Coverage % is reported but no minimum threshold yet — Phase 4 may
  raise the floor once the baseline solidifies.
- Integration tests slow down CI by ~30–60 s; acceptable for the
  isolation guarantee they provide.

## References

- Phase 2 CI: commit `ce10f38`.
- Phase 3 Task 6 (in progress / Phase 3 follow-up). Link commits
  here when they land.
