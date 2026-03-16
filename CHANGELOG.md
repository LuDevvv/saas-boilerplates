# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-05

### Added

- **Core API**: Hono-based edge API with strictly typed modules and DI.
- **Frontend**: Astro + React landing page with premium aesthetics.
- **Dashboard**: Real-time stats, workspace management, team inviting, and profile settings.
- **Auth**: Multi-provider support (GitHub, Google, Email) + 2FA (TOTP).
- **Billing**: LemonSqueezy and Creem.io integration with webhook idempotency.
- **Database**: Drizzle ORM with Neon Serverless PostgreSQL and safe migrations.
- **CI/CD**: GitHub Actions for auto-migrations, bundle size checking, and global deployment.
- **Security**: Granular rate limiting, CSRF protection, secure headers, and error sanitization.
- **Shared Packages**: `ui`, `validators`, `db`, `services`, `emails`, and `types`.
- **Jobs Worker**: Isolated worker for React-Email rendering and Resend delivery.

### Fixed

- Bundle size optimization (from ~700KB to < 400KB target for core API).
- JWT refresh rotation logic.
- Webhook duplicate processing.

### Security

- Content Security Policy (CSP) and Permissions Policy enforcement.
- Rate-limited auth and organization endpoints.
- Sanitized error responses in production.

---

[1.0.0]: https://github.com/LuDevvv/startup-edge-stack/releases/tag/v1.0.0
