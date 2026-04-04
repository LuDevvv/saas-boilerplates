# Node Stack SaaS Backend — Architecture Whitepaper

Author: OpenCode Assistant
Last updated: 2026-03-24

Executive summary

- This document captures the architectural decisions, data model, and operational practices for the Node Stack SaaS backend. The system is a monorepo-based stack using NestJS, Drizzle ORM with PostgreSQL, Redis, and a modular RBAC/validation strategy. It emphasizes safety, scalability, and developer productivity through declarative access control, event-driven processing, and automated migrations.

1. System overview

- The backend is organized as a monorepo with distinct packages for database access, business logic, and domain features. Core layers include:
  - API (NestJS v10) — public interface, controllers, guards, and business services
  - Auth — local and OAuth-based authentication with JWT sessions
  - RBAC — declarative authorization via @Roles, @RequirePermissions, and RolesGuard
  - Workspaces, Invitations, Memberships — domain logic around workspace collaboration
  - Outbox + Worker (BullMQ) — asynchronous event processing with retry/backoff and eventual consistency
  - Validation — planned migration to a single, centralized validation strategy (Zod) across the codebase (P3-007)
- The system supports migration-driven deployment (P3-010) where database migrations run automatically as part of the container startup and deploy flow.
- Observability is provided by structured logging (P2-005) using pino, and development-time SQL logging (P2-006).

2. Tech stack

- Language: TypeScript (Node.js)
- Framework: NestJS (v10)
- ORM: Drizzle ORM (PostgreSQL)
- Database: PostgreSQL
- Caching: Redis (for sessions and workspaces cache)
- Message/Job Queuing: BullMQ (via NestJS BullMQ integration)
- Storage: MinIO (S3-compatible storage integration)
- OAuth: Google and GitHub strategies via Passport
- Validation: to be unified with Zod (P3-007 plan)
- Migrations: drizzle-kit for schema migrations
- Observability: pino for structured logging; optional metrics integration later
- Deployment: Docker-based with automated migrations (P3-010) and health checks
- CI/CD: GitHub Actions example with migration steps

3. Data model (key tables)

- users: core user account data (id, email, passwordHash, name, etc.)
- sessions: session tokens for JWT-based auth (id, userId, expiresAt)
- workspaces: collaborative workspaces (id, name, slug, etc.)
- memberships: user-to-workspace mapping with role (owner/admin/member)
- invitations: pending workspace invitations
- audit_logs: event log (for auditing)
- outbox: internal event store for integration with the Outbox/Worker pattern
- oauth_accounts: linkage between users and OAuth providers (provider, providerAccountId, accessToken, refreshToken, etc.)
- migrations: drizzle-kit migrations table (metadata about last applied migration)
- The repository pattern is evolving towards more explicit data access layers (BaseRepository, UserRepository, WorkspaceRepository) to enable cleaner unit tests and clearer boundaries.

4. Architecture and modules

- API Layer
  - Controllers expose REST endpoints for authentication, workspaces, storage, billing, health, etc.
  - Guards enforce RBAC using @Roles and @RequirePermissions; RBAC is enforced at routing level for access control (Category A) and business rules at service level (Category B).
- Authentication & RBAC
  - Local and OAuth (Google/GitHub) implemented via Passport strategies.
  - handleOAuthLogin(profile) introduced to centralize OAuth login flow, creating/attaching user accounts and issuing tokens.
  - JWT sessions are generated with createSession and the generateTokens flow is reused to maintain consistency.
- Domain Model (Workspaces, Invitations, Memberships)
  - WorkspacesService and InvitationsService enforce business rules (Category B) while access control is handled by the RBAC layer.
- Outbox + Worker
  - Outbox stores events that should be processed downstream.
  - BullMQ-based worker processes outbox events, with configurable retries and backoff (P2-007).
  - A DLQ path and instrumentation can be introduced in a follow-up.
- Validation & Security
  - Current plan is to migrate to Zod as the single validation source of truth and adopt nestjs-zod for a single pipeline, with OpenAPI generation from Zod schemas.
- Health and Observability
  - Health module exposes dependencies (database, Redis, MinIO) and readiness checks.
  - Structured logging (P2-005) and development-time SQL logging (P2-006) are integrated.

5. Data lifecycle and migrations

- Migrations are automated via drizzle-kit as part of the deploy/startup sequence (P3-010).
- Database migrations run before the application starts in containerized or orchestrated environments to ensure a consistent schema at runtime.
- Migration health is surfaced via health checks that can report the last applied migration.

6. Validation strategy (current state and roadmap)

- Current state: some DTO validation uses class-validator within some DTOs; a plan exists to consolidate validation behind Zod across the codebase (P3-007). See: consolidated validators package (packages/validators) with schemas for core domains.
- Roadmap: migrate DTOs, remove class-validator, rely exclusively on ZodPipe in controllers, add Swagger/OpenAPI generation from Zod schemas.

7. Security and RBAC

- Guarded by RolesGuard and PermissionsGuard; route decorators include @Roles and @RequirePermissions.
- Helmet security headers are applied at startup (P3-007) and X-Powered-By header is disabled to reduce fingerprinting.
- OAuth2 flows are protected with PKCE and state if needed; ensure redirect URIs are configured in env.

8. Deployment and DevOps

- Automated migrations on startup (Dockerfile or startup script) ensure no manual intervention is required.
- Health checks reflect migration status and dependency availability.
- CI/CD: pipeline runs migrations, builds the app, and validates health endpoint post-deploy.

9. Developer guidelines

- Follow the Phase 2 migration plan for validation consolidation (Zod).
- Use Outbox/Worker pattern for all async side effects.
- Use the repository pattern (BaseRepository, UserRepository, WorkspaceRepository) to abstract data access and enable testability.
- Add unit tests for OAuth flows and guard logic as new features are introduced.

10. Risks and mitigations

- Migration failures: ensure container startup fails and rolls back if migrations fail (config in Dockerfile or startup script).
- OAuth tokens: store tokens securely and rotate refresh tokens; use short-lived access tokens.
- Secrets: keep secrets in environment and secret management systems; never commit in repo.

11. References (docs used during development)

- P2-003: Replace Outbox Polling with BullMQ
- P2-005: Structured Logging with pino
- P2-006: Database Query Logging (development-only)
- P3-007: Remove inline RBAC; unify with Guards and decorators
- P3-010: Automated Migration on Deploy
- P0 backlog and internal architecture notes

Appendix A: Glossary

- RBAC: Role-Based Access Control
- Outbox: a store of domain events to be published/processed asynchronously
- DLQ: Dead Letter Queue (for failed messages)
- ZodPipe: NestJS integration for Zod schemas in request bodies
- drizzle-kit: CLI for database migrations with Drizzle ORM

Appendix B: Quickstart (typical workflow)

- Clone repo, install dependencies, configure env, and run: docker-compose up -d api
- API starts after migrations run in container startup script
- Access health endpoint for readiness and system health

Appendix C: Contact

- For questions about this architecture whitepaper, contact the lead architect or maintainer.
