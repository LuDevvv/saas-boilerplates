# 🏗️ Architecture: Edge-Native Microservices

L.A. Labs is built on the premise that the future of web applications is **Edge-native**. We trade the heavy overhead of traditional Node.js/Docker deployments for sub-millisecond cold starts and global distribution across 300+ Cloudflare PoPs.

## 1. System Overview

The platform runs as **two Cloudflare Workers** (microservices) with a shared package layer:

```text
┌─────────────────────────────────────────────────────────────┐
│                       Cloudflare Edge                       │
│                                                             │
│  ┌──────────────┐         Queue         ┌────────────────┐  │
│  │  API Worker   │ ──── (async) ──────▸ │  Jobs Worker   │  │
│  │  (apps/api)   │                      │(apps/jobs-worker│  │
│  │              │                      │                │  │
│  │  Hono + Zod  │                      │  React Email   │  │
│  │  OpenAPI     │                      │  + Resend      │  │
│  └──────┬───────┘                      └────────────────┘  │
│         │                                                   │
│    ┌────▼────────────────────────────────────┐              │
│    │          Shared Packages Layer          │              │
│    │                                         │              │
│    │  packages/db         Drizzle + Neon     │              │
│    │  packages/services   Business Logic     │              │
│    │  packages/validators Zod Schemas        │              │
│    │  packages/types      Shared Interfaces  │              │
│    │  packages/emails     React Email Tpls   │              │
│    │  packages/ui         Shadcn/Radix       │              │
│    │  packages/config     ESLint/TS/Tailwind │              │
│    │  packages/testing    SQLite Test Bridge  │              │
│    └─────────────────────────────────────────┘              │
│                                                             │
│  ┌──────────────┐                                           │
│  │  Web (SSG)   │  Astro + React Islands                    │
│  │  (apps/web)  │  Deployed to Cloudflare Pages             │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
         │
    ┌────▼──────┐
    │  Neon DB   │  Serverless PostgreSQL (HTTP driver)
    └───────────┘
```

## 2. The Edge Runtime (Cloudflare Workers)

We strictly use the **Cloudflare Workers** runtime (V8 Isolates). This means:

- **Zero Node.js modules**: No `fs`, `crypto`, `buffer`, `path`, `stream`. We use Web Standard APIs (`crypto.subtle`, `fetch`, `URL`, `Request`, `Response`).
- **Sub-50ms globally**: Code runs in 300+ locations simultaneously.
- **Stateless execution**: Every request gets a fresh isolate. No global state survives across requests.
- **Thin bundles**: The API Worker stays < 400KB. Heavy work (email rendering) is offloaded to the Jobs Worker via Cloudflare Queues.

## 3. Microservices Split

### API Worker (`apps/api`)

The core HTTP API. Handles authentication, authorization, CRUD, billing, and metrics.

- **Framework**: Hono v4 with OpenAPI/Zod integration
- **Responsibilities**: HTTP routing, input validation, middleware chain, response formatting
- **Pattern**: Domain-Driven Modular Architecture (see Section 5)

### Jobs Worker (`apps/jobs-worker`)

An asynchronous task consumer that processes background jobs from Cloudflare Queues.

- **Current capability**: React Email template rendering + Resend delivery
- **Why separate?**:
  - `react-dom/server` + `resend` add ~300KB that would bloat the API bundle
  - Queue consumers scale independently of HTTP workers
  - If Resend fails, `message.retry()` handles it without impacting API uptime
- **Extensible for**: PDF generation, CRM syncing, image processing, webhook retries

### Web (`apps/web`)

The public-facing frontend. Deployed to Cloudflare Pages.

- **Framework**: Astro 4 + React 18 Islands
- **Architecture**: Static by Default — React hydration only for interactive components
- **API Communication**: End-to-end typed Hono RPC client (`hc<AppType>`)

## 4. Shared Packages (Dependency Flow)

The dependency graph flows **strictly downward**. Apps consume packages; packages never consume apps.

| Package               | Purpose            | Key Exports                                                   |
| --------------------- | ------------------ | ------------------------------------------------------------- |
| `packages/db`         | Data Access Layer  | Drizzle schemas (11), repositories (10), Neon HTTP driver     |
| `packages/services`   | Business Logic     | Auth, Billing (multi-provider), Workspaces, Tasks services    |
| `packages/validators` | Request Validation | Zod schemas for auth, billing, workspaces, users, invitations |
| `packages/types`      | Shared Interfaces  | AppError, QueueMessage, EmailJobPayload                       |
| `packages/emails`     | Email Templates    | React Email components: Welcome, PasswordReset, TeamInvite    |
| `packages/ui`         | Design System      | Shadcn/Radix components: Button, Card, Dialog, Input, etc.    |
| `packages/config`     | Shared Config      | TSConfig, ESLint, Tailwind presets                            |
| `packages/testing`    | Test Utilities     | SQLite bridge, mock factories, test helpers                   |

## 5. Domain-Driven Modular Architecture

The API uses a modular structure where each domain is self-contained:

```text
apps/api/src/
├── index.ts              # Worker entry point — route assembly + Sentry wrapper
├── app.ts                # Hono instance — global middlewares
├── common/               # Cross-cutting concerns
│   ├── middlewares/       # 15 middlewares (auth, RBAC, rate limit, CORS, etc.)
│   ├── errors/           # AppError exception class
│   ├── responses/        # successResponse() / errorResponse() factories
│   ├── services/         # Infrastructure services (email, cache, queue, analytics)
│   ├── types/            # AppContext, Bindings, Variables
│   └── utils/            # Helpers (IP extraction, etc.)
└── modules/              # Feature domains
    ├── auth/             # Login, Register, 2FA, OAuth (Google/Facebook)
    ├── users/            # Profile, Avatar, Me
    ├── workspaces/       # CRUD, Invitations, Memberships
    ├── billing/          # Checkout, Webhooks, Subscription Status, Portal
    ├── storage/          # R2 presigned uploads
    ├── tasks/            # CRUD example module
    └── metrics/          # Dashboard aggregate metrics
```

### Request Lifecycle (Strict Enforcement)

```text
HTTP Request
  │
  ▼
Route (*.routes.ts)       → Zod validation, middleware chain
  │
  ▼
Controller (*.controller.ts) → Extract context, call Service, format response
  │
  ▼
Service (packages/services)  → Business logic, orchestration
  │
  ▼
Repository (packages/db)     → Drizzle queries, DB access
```

**Rules**:

- Controllers never contain business logic or raw DB queries
- Services never return HTTP responses — they throw `AppError` on failure
- Repositories are the **only** layer aware of the database schema
- All API responses use `successResponse()` / `errorResponse()` wrappers

## 6. Billing Architecture (Multi-Provider)

The billing system uses a **Provider Adapter Pattern** to support multiple payment gateways:

```text
BillingController
  │
  ├── getActiveProvider(c)  ← reads BILLING_PROVIDER env var
  │       │
  │   ┌───▼───────────────────┐
  │   │   PaymentProvider     │ ← Interface
  │   │   Interface           │
  │   ├───────────────────────┤
  │   │ createCheckout()      │
  │   │ verifyWebhook()       │
  │   │ getCustomerPortalUrl()│
  │   └───┬───────────┬───────┘
  │       │           │
  │   LemonSqueezy  Creem.io
  │   Provider      Provider
  │
  ▼
BillingService
  │
  ├── syncSubscription()          ← Standardized data
  ├── getSubscriptionStatus()     ← From DB
  ├── getCustomerPortalUrl()      ← Delegates to provider
  ├── normalizeLemonSqueezyPayload()
  └── normalizeCreemPayload()
```

**Provider selection** is determined by the `BILLING_PROVIDER` environment variable (`"lemonsqueezy"` | `"creem"`).

## 7. Frontend Islands Architecture

The web frontend follows Astro's Islands Architecture:

- **Static by default**: Layouts, typography, SEO metadata are pure `.astro` files
- **React Islands**: Only for interactive components (forms, dashboards, modals)
- **Hydration directives**: `client:load` (above fold), `client:visible` (below fold), `client:idle` (low priority)

### Data Fetching Pattern

All API communication uses the typed Hono RPC client:

```typescript
import { hc } from "hono/client";
import type { AppType } from "../../../api/src/index";

export const client = hc<AppType>(baseUrl, { headers: () => ({...}) });

// Usage in hooks:
const res = await client.api.billing.subscription.$get();
```

Custom hooks handle all data fetching (`useCheckout`, `useSubscriptionStatus`, `useDashboardMetrics`, `useCustomerPortal`), keeping `.tsx` components focused on rendering.

## 8. Security Architecture

| Layer                | Mechanism                                                        |
| -------------------- | ---------------------------------------------------------------- |
| **Authentication**   | JWT (HS256) via `jose` + HttpOnly cookies                        |
| **2FA**              | TOTP with Web Crypto API                                         |
| **OAuth**            | Google + Facebook via authorization code flow                    |
| **Bot Protection**   | Cloudflare Turnstile CAPTCHA                                     |
| **Authorization**    | RBAC via `permissionGuard` middleware                            |
| **Multi-Tenancy**    | `workspaceGuard` middleware scopes all requests to `workspaceId` |
| **Rate Limiting**    | KV-backed sliding window per endpoint                            |
| **Webhook Security** | HMAC SHA-256 verification via `crypto.subtle`                    |
| **Secure Headers**   | CSP, HSTS, X-Frame-Options, X-Content-Type-Options               |

## 9. Monitoring & Observability

| Concern                | Tool    | Integration                                    |
| ---------------------- | ------- | ---------------------------------------------- |
| **Error Tracking**     | Sentry  | Workers wrapped with `@sentry/cloudflare`      |
| **Structured Logging** | Axiom   | Custom Hono middleware pushes logs per-request |
| **Product Analytics**  | PostHog | Frontend events + backend server-side tracking |
| **API Documentation**  | Scalar  | Auto-generated from OpenAPI spec at `/docs`    |
