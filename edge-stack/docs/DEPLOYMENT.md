# 🚀 Deployment: Cloudflare Edge Infrastructure

The entire platform runs within the Cloudflare ecosystem — Workers for compute, Pages for the frontend, and managed services for storage and messaging.

## 1. Deployment Targets

| App                | Deploy Target      | Method                              |
| ------------------ | ------------------ | ----------------------------------- |
| `apps/api`         | Cloudflare Workers | `wrangler deploy`                   |
| `apps/jobs-worker` | Cloudflare Workers | `wrangler deploy` (separate worker) |
| `apps/web`         | Cloudflare Pages   | Astro adapter + Git integration     |

### Why Two Workers?

The API Worker and Jobs Worker are **separate Cloudflare Workers** with independent bundles:

- **API Worker**: Handles all HTTP requests. Must stay < 400KB for minimal cold starts.
- **Jobs Worker**: Consumes Cloudflare Queues for async tasks (email rendering). Imports `react-dom/server` which would bloat the API bundle if combined.

Both workers share packages (`packages/db`, `packages/services`, `packages/types`, `packages/validators`) at build time — the bundler tree-shakes unused code per worker.

## 2. Cloudflare Resource Provisioning

Ensure the following resources are provisioned in your Cloudflare dashboard:

### 🗳️ Storage & Data

| Resource     | Binding Name    | Purpose                                       |
| ------------ | --------------- | --------------------------------------------- |
| KV Namespace | `CACHE_KV`      | Metadata and auth session caching             |
| KV Namespace | `USAGE_KV`      | Real-time billing/usage counters              |
| KV Namespace | `RATE_LIMIT_KV` | Sliding window rate limit state               |
| R2 Bucket    | `R2_BUCKET`     | Public/private file storage (avatars, assets) |

### ⚙️ Compute & Messaging

| Resource     | Binding Name                 | Purpose                                  |
| ------------ | ---------------------------- | ---------------------------------------- |
| Queue        | `JOBS_QUEUE` / `EMAIL_QUEUE` | Async background task delivery           |
| Queue (DLQ)  | `email-jobs-dlq`             | Dead letter queue for failed email jobs  |
| Rate Limiter | `RATE_LIMITER`               | Cloudflare Workers Rate Limiting binding |

## 3. Environment Variables

### API Worker (`apps/api`)

| Variable                      | Description                                                | How to Get It                                                                  |
| ----------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`                | Neon Serverless PostgreSQL connection string (HTTP pooler) | [Neon Dashboard](https://console.neon.tech/) → Project → Connection Details    |
| `JWT_SECRET`                  | Secret for signing auth tokens                             | `openssl rand -hex 32`                                                         |
| `PUBLIC_APP_URL`              | Frontend URL for CORS/CSRF origin validation               | Your Cloudflare Pages URL                                                      |
| `TURNSTILE_SECRET_KEY`        | Cloudflare Turnstile CAPTCHA server key                    | [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile               |
| `BILLING_PROVIDER`            | Active payment provider (`"lemonsqueezy"` or `"creem"`)    | Set based on your chosen provider                                              |
| `LEMONSQUEEZY_API_KEY`        | LemonSqueezy API key                                       | [LemonSqueezy](https://app.lemonsqueezy.com/) → Settings → API                 |
| `LEMONSQUEEZY_STORE_ID`       | LemonSqueezy Store identifier                              | LemonSqueezy Dashboard → Stores                                                |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | HMAC secret for webhook verification                       | LemonSqueezy → Webhooks → Signing Secret                                       |
| `CREEM_API_KEY`               | Creem.io API key                                           | [Creem Dashboard](https://dashboard.creem.io/) → API                           |
| `CREEM_WEBHOOK_SECRET`        | HMAC secret for Creem webhook verification                 | Creem Dashboard → Webhooks                                                     |
| `GOOGLE_CLIENT_ID`            | Google OAuth Client ID                                     | [Google Cloud Console](https://console.cloud.google.com/) → APIs → Credentials |
| `GOOGLE_CLIENT_SECRET`        | Google OAuth Client Secret                                 | Same as above                                                                  |
| `FACEBOOK_APP_ID`             | Facebook OAuth App ID                                      | [Facebook Developers](https://developers.facebook.com/) → App Settings         |
| `FACEBOOK_APP_SECRET`         | Facebook OAuth App Secret                                  | Same as above                                                                  |
| `SENTRY_DSN`                  | Sentry project DSN for error tracking                      | [Sentry](https://sentry.io/) → Project Settings → Client Keys                  |
| `AXIOM_TOKEN`                 | Axiom ingest API token                                     | [Axiom](https://axiom.co/) → Settings → API Tokens                             |
| `AXIOM_DATASET`               | Axiom dataset name for logs                                | Axiom Dashboard → Datasets                                                     |
| `POSTHOG_PROJECT_KEY`         | PostHog project API key                                    | [PostHog](https://posthog.com/) → Project Settings                             |

### Jobs Worker (`apps/jobs-worker`)

| Variable         | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `RESEND_API_KEY` | [Resend](https://resend.com/) API key for transactional emails |

## 4. CI/CD (GitHub Actions)

### Testing Phase (on PR)

```bash
pnpm lint          # ESLint across monorepo
pnpm typecheck     # tsc --noEmit per app/package
pnpm test          # Both Edge pool + Logic pool
```

### Deployment Phase (on merge to `main`)

```bash
# API Worker
cd apps/api && wrangler deploy

# Jobs Worker
cd apps/jobs-worker && wrangler deploy

# Web (automatic via Cloudflare Pages Git integration)
```

## 5. Monitoring & Alerting

### Error Tracking (Sentry)

Both workers are wrapped with `@sentry/cloudflare`:

```typescript
export default Sentry.withSentry(
  (env) => ({ dsn: env.SENTRY_DSN, tracesSampleRate: 1.0 }),
  { fetch: app.fetch, queue: queueHandler },
);
```

### Structured Logging (Axiom)

Custom Hono middleware logs every request:

- Method, path, status code, latency
- User ID, workspace ID (if authenticated)
- Error details (if any)

### Product Analytics (PostHog)

- **Frontend**: Client-side event tracking
- **Backend**: Server-side events via `c.executionCtx.waitUntil()`

### Dead Letter Queue Monitoring

Failed email jobs retry automatically. After max retries, they land in `email-jobs-dlq`. Set up a Cloudflare Worker alarm or external monitor to alert on DLQ depth.

## 6. Scaling Considerations

| Layer             | Scaling Strategy                                |
| ----------------- | ----------------------------------------------- |
| **API Worker**    | Auto-scales with traffic (Cloudflare manages)   |
| **Jobs Worker**   | Queue consumer auto-scales with message volume  |
| **Database**      | Neon auto-scaling (configurable compute limits) |
| **File Storage**  | R2 — unlimited objects, pay per request         |
| **Rate Limiting** | KV-backed, globally distributed                 |

If you hit Neon read throughput limits, implement read-through caching via `CACHE_KV` in the service layer.
