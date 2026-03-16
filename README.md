# 🚀 L.A. Labs: The Startup Edge Stack

A production-ready, strictly typed SaaS monorepo optimized for the **Cloudflare Edge Runtime**. Sub-50ms global latency, multi-tenant billing, and zero-overhead deployments.

## 🛠️ Stack Overview

- **API**: [Hono](https://hono.dev/) v4 + OpenAPI/Zod on [Cloudflare Workers](https://workers.cloudflare.com/)
- **Web**: [Astro](https://astro.build/) 4 + React 18 Islands on [Cloudflare Pages](https://pages.cloudflare.com/)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) + [Neon](https://neon.tech/) Serverless PostgreSQL
- **Billing**: Multi-provider (LemonSqueezy + Creem.io) via adapter pattern
- **Email**: [React Email](https://react.email/) templates + [Resend](https://resend.com/) delivery
- **Testing**: [Vitest](https://vitest.dev/) dual-pool (Edge + Logic)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **Monorepo**: [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)

---

## ⚡ Quick Start

### 1. Installation

```bash
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Fill in your Neon, Cloudflare, and API keys (see docs/DEPLOYMENT.md)
```

### 3. Database Setup

```bash
cd packages/db
pnpm push      # Apply schema to Neon
pnpm studio    # Browse data visually
```

### 4. Local Development

```bash
pnpm dev       # Starts API Worker + Web frontend concurrently
```

---

## 📂 Monorepo Map

```text
.
├── apps/
│   ├── api/                # Hono API → Cloudflare Workers
│   ├── jobs-worker/        # Queue consumer → Email rendering + Resend
│   └── web/                # Astro + React → Cloudflare Pages
├── packages/
│   ├── config/             # Shared ESLint, TSConfig, Prettier, Tailwind
│   ├── db/                 # Drizzle schemas (11), repositories (10), Neon driver
│   ├── emails/             # React Email templates (Welcome, Reset, Invite)
│   ├── services/           # Business logic (Auth, Billing, Workspaces, Tasks)
│   ├── testing/            # In-memory SQLite test harness & mocks
│   ├── types/              # Shared TypeScript interfaces (AppError, QueueMessage)
│   ├── ui/                 # Shadcn/Radix component library
│   └── validators/         # Zod schemas for cross-package validation
├── scripts/                # DevEx tooling (module scaffolding)
├── docs/                   # Architecture, Database, Deployment, Testing guides
└── turbo.json              # Build pipeline configuration
```

---

## 🏗️ Key Features

| Feature                     | Status | Details                                                      |
| --------------------------- | ------ | ------------------------------------------------------------ |
| **Multi-Tenant Workspaces** | ✅     | RBAC (Owner/Admin/Member), invitations, isolation            |
| **Authentication**          | ✅     | JWT + HttpOnly cookies, 2FA (TOTP), OAuth (Google, Facebook) |
| **Multi-Provider Billing**  | ✅     | LemonSqueezy + Creem.io via adapter pattern                  |
| **Customer Portal**         | ✅     | Provider-agnostic subscription management                    |
| **Dashboard Metrics**       | ✅     | Real-time workspace stats (members, tasks, usage)            |
| **File Storage**            | ✅     | Cloudflare R2 with presigned uploads                         |
| **Transactional Email**     | ✅     | Async queue processing via Jobs Worker                       |
| **Rate Limiting**           | ✅     | KV-backed sliding window per endpoint                        |
| **Error Tracking**          | ✅     | Sentry integration for both Workers                          |
| **Structured Logging**      | ✅     | Axiom per-request log pipeline                               |
| **API Documentation**       | ✅     | Auto-generated OpenAPI spec + Scalar UI at `/docs`           |
| **i18n**                    | ✅     | EN/ES dictionaries shared between API and Web                |
| **Bot Protection**          | ✅     | Cloudflare Turnstile CAPTCHA                                 |

---

## 🏗️ Guiding Principles

- **Edge First**: No Node.js native modules. Web Standard APIs only (`crypto.subtle`, `fetch`, `URL`).
- **Type Safety**: End-to-end from DB schema → Zod validators → Hono RPC → React hooks.
- **Provider Agnostic**: Billing, email, and storage are swappable via adapter interfaces.
- **Modular Monorepo**: Apps consume packages; packages never consume apps.
- **Bundle Discipline**: API Worker < 400KB. Heavy work offloaded to Jobs Worker via Queues.

---

## 📖 Documentation

| Document                               | Content                                                         |
| -------------------------------------- | --------------------------------------------------------------- |
| [Architecture](./docs/ARCHITECTURE.md) | System overview, microservices split, design patterns, security |
| [Database](./docs/DATABASE.md)         | Schema catalog, repository pattern, migrations, multi-tenancy   |
| [Deployment](./docs/DEPLOYMENT.md)     | Cloudflare provisioning, env vars, CI/CD, monitoring            |
| [Testing](./docs/TESTING.md)           | Dual-pool strategy, SQLite bridge, examples                     |

---

## 📜 License

See [LICENSE](./LICENSE) for details.
