# Architecture Decision Records

This directory captures the load-bearing decisions made on `node-stack`
during the post-audit hardening phases. Each ADR follows Michael
Nygard's template (Context / Decision / Consequences) and is kept
under 400 words.

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-rls-strategy.md) | Row-Level Security via tenant/system tx wrappers | Accepted |
| [0002](0002-audit-logging-strategy.md) | Audit logging strategy | Accepted |
| [0003](0003-soft-delete-strategy.md) | Soft-delete with 30-day grace | Accepted |
| [0004](0004-test-strategy.md) | Test strategy and CI gates | Accepted |

Reference: `docs/technical-audit-2026-05-07.md` for the audit report
that motivated the bulk of these decisions.
