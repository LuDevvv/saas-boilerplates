# Getting Started with node-stack

A production-ready SaaS boilerplate: multi-tenant API (NestJS), React dashboard, Next.js landing page, background worker, and a shared component library.

---

## What's included

| App / Package | Stack | Port |
|---|---|---|
| `apps/api` | NestJS · Drizzle · PostgreSQL · Redis | 3000 |
| `apps/dashboard` | React 19 · Vite · TanStack Query · Zustand | 5173 |
| `apps/web` | Next.js 15 · Tailwind | 3001 |
| `apps/worker` | NestJS · BullMQ | — |
| `apps/e2e` | Playwright | — |
| `packages/ui` | Radix UI · Tailwind · Storybook | — |
| `packages/db` | Drizzle ORM · RLS helpers | — |
| `packages/api-client` | Axios · TanStack Query hooks | — |
| `packages/types` | Shared TypeScript types | — |
| `packages/validators` | Zod schemas shared by API and frontend | — |
| `packages/config` | Typed env validation (Zod) | — |

---

## Prerequisites

- **Node.js** 20+ (use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm))
- **pnpm** 9+ — `npm install -g pnpm`
- **Docker** and **Docker Compose** (for Postgres + Redis)
- **Git**

---

## 1. Clone and install

```bash
git clone https://github.com/LuDevvv/saas-boilerplates.git
cd saas-boilerplates/node-stack
pnpm install
```

---

## 2. Environment variables

Copy the example file and fill in required values:

```bash
cp .env.example .env
```

Open `.env` and set the following (marked **required** — the rest have sensible defaults for local dev):

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **yes** | — | PostgreSQL connection string |
| `MIGRATION_DATABASE_URL` | **yes** | — | Direct Postgres URL for Drizzle migrations (no PgBouncer) |
| `REDIS_URL` | **yes** | `redis://localhost:6379` | Redis connection URL |
| `JWT_SECRET` | **yes** | — | Min 32-char random string. Generate: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | **yes** | — | Separate secret for refresh tokens |
| `SESSION_SECRET` | **yes** | — | Express session signing key |
| `API_KEY_PEPPER` | **yes** | — | Static pepper for API key hashing |
| `POSTGRES_USER` | dev only | `app_user` | Used by docker-compose |
| `POSTGRES_PASSWORD` | dev only | `changeme` | Used by docker-compose |
| `POSTGRES_DB` | dev only | `app` | Used by docker-compose |
| `FRONTEND_URL` | **yes** | `http://localhost:5173` | Dashboard origin (CORS) |
| `APP_URL` | **yes** | `http://localhost:3000` | API origin (email links) |
| `EMAIL_PROVIDER` | no | `console` | `console` logs emails locally |
| `STORAGE_PROVIDER` | no | `local` | `local` stores files in `uploads/` |
| `AI_PROVIDER` | no | — | `openrouter` or `anthropic` |
| `POLAR_ORGANIZATION_ID` | billing only | — | Polar.sh organization ID |

---

## 3. Start infrastructure (Postgres + Redis)

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- (Production compose also includes PgBouncer and a Redis replica)

Verify they are running:

```bash
docker compose ps
```

---

## 4. Run database migrations and seed

```bash
# Apply all migrations
pnpm db:migrate

# Seed with initial data (admin user + demo workspace)
pnpm db:seed
```

Default seed credentials (change before deploying):

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `Admin1234!` |

To open Drizzle Studio (visual DB browser):

```bash
pnpm db:studio
```

---

## 5. Run the apps

Start everything at once in development mode:

```bash
pnpm dev
```

Or start individual apps:

```bash
pnpm --filter @node-stack/api       dev   # API:       http://localhost:3000
pnpm --filter @node-stack/dashboard dev   # Dashboard: http://localhost:5173
pnpm --filter @node-stack/web       dev   # Web:       http://localhost:3001
pnpm --filter @node-stack/worker    dev   # Worker (background jobs)
```

---

## 6. API documentation

With the API running:

- **Swagger UI** → [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Scalar UI** → [http://localhost:3000/api/reference](http://localhost:3000/api/reference)
- **Health check** → [http://localhost:3000/health](http://localhost:3000/health)
- **Metrics** → [http://localhost:3000/metrics](http://localhost:3000/metrics)

---

## 7. Run tests

```bash
# Unit tests (Vitest)
pnpm --filter @node-stack/dashboard test

# Storybook component stories
pnpm --filter @node-stack/ui storybook

# E2E tests (Playwright) — requires all apps running
pnpm test:e2e
```

TypeScript and lint checks:

```bash
# TypeScript (per-app, matches pre-commit hook)
cd apps/api    && npx tsc -b --noEmit
cd apps/worker && npx tsc -b --noEmit

# Lint all packages
pnpm lint

# Build all packages and apps
pnpm build
```

---

## 8. Customize for your project

### Rename the project

1. `package.json` in each `apps/*` and `packages/*`: change `name` field
2. `pnpm-workspace.yaml`: no changes needed (uses glob)
3. `apps/dashboard/vite.config.ts`: update the PWA `name` and `short_name`
4. `apps/web/`: update metadata in `src/app/layout.tsx`
5. `.env.example`: update `PROJECT_NAME` and `REDIS_PREFIX`

### Add a new database table

1. Define the schema in `packages/db/src/schema/`
2. Add the repository class in `packages/db/src/repositories/`
3. Export from `packages/db/src/index.ts`
4. Run `pnpm db:generate` (interactively) to generate the migration SQL
5. Run `pnpm db:migrate` to apply

> See `packages/db/migrations/` for existing migration examples.
> CLAUDE.md documents the migration journal gap workaround for 0012–0016.

### Add a new API endpoint

```
apps/api/src/<module>/
  <module>.module.ts
  <module>.controller.ts
  <module>.service.ts
  dto/
    create-<module>.dto.ts
```

Register the module in `apps/api/src/app.module.ts`.

All RLS-protected tables must use `withTenantTx` or `withSystemTx` — never raw `this.db.query.*`. See `CLAUDE.md` for the full invariant.

### Add audit logging to a new action

```typescript
import { AUDIT_ACTIONS } from "@node-stack/db";

// Inside withTenantTx:
await this.auditLog.create({
  action: AUDIT_ACTIONS.YOUR_ACTION,
  userId: currentUser.id,
  workspaceId,
  entityType: "your_entity",
  entityId: entity.id,
  metadata: { /* non-sensitive context */ },
}, tx);
```

Allowed action strings are enumerated in `docs/0002-audit-logging-strategy.md`.

### Add a new worker job

1. Create a processor in `apps/worker/src/processors/`
2. Register it in `apps/worker/src/worker.module.ts`
3. Enqueue jobs via `JobService.enqueue()` from `packages/queue`

### Customize the landing page

The landing page lives in `apps/web/src/`. Key files:

- `src/app/page.tsx` — root page (assembles sections)
- `src/components/` — individual sections (Hero, Features, Pricing, etc.)
- `src/app/layout.tsx` — metadata, fonts, JSON-LD
- `src/styles/` — CSS design tokens

---

## 9. Deployment

### apps/api (NestJS)

- Build: `pnpm --filter @node-stack/api build`
- Output: `apps/api/dist/`
- Run: `node apps/api/dist/main.js`
- Recommended platforms: Railway, Render, Fly.io, EC2/ECS

Set all required env vars from `.env.example`. Run `pnpm db:migrate` as a pre-deploy step.

### apps/worker

Same as `apps/api` but set `WORKER_MODE=true`. Can share the same Docker image.

### apps/dashboard (Vite SPA)

- Build: `pnpm --filter @node-stack/dashboard build`
- Output: `apps/dashboard/dist/`
- Deploy the `dist/` folder to any CDN: Vercel, Netlify, S3 + CloudFront

Set `VITE_API_URL` to the production API URL.

### apps/web (Next.js)

- Build: `pnpm --filter @node-stack/web build`
- Recommended: Vercel (zero-config)
- Or self-host with `node apps/web/.next/standalone/server.js`

### Database migrations in production

```bash
DATABASE_URL="your-prod-url" MIGRATION_DATABASE_URL="your-prod-url" pnpm db:migrate
```

Run this before deploying a new API version.

---

## 10. Architecture overview

- **ADR decisions** → `docs/` (0001-rls-strategy.md through 0009-multi-region-strategy.md)
- **Engineering guardrails** → `CLAUDE.md` (RLS, audit, migrations, commits)
- **Storybook** → run `pnpm --filter @node-stack/ui storybook` for the full component catalog
- **Feature-Sliced Design** is used in `apps/dashboard/src/` (`app/`, `features/`, `entities/`, `shared/`, `pages/`)
