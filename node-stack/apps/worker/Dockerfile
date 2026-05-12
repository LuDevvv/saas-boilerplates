# ── Stage 1: Prune — strip the monorepo to only what @node-stack/worker needs ──
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @node-stack/worker --docker

# ── Stage 2: Builder — install deps and compile TypeScript ─────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Pin pnpm to a known-good version (matches packageManager field in package.json)
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate

# Manifest layer — only re-runs when package.json / lockfile changes
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Source + compile
# After this COPY, files land at /app/apps/worker/, /app/packages/db/, etc.
COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter @node-stack/worker...

# Deploy production deps to a clean directory
RUN pnpm deploy --filter @node-stack/worker --prod /app/deployed

# ── Stage 3: Runner — minimal distroless image ────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV RUN_MIGRATIONS=false

# Deployed app: production node_modules + built code
COPY --from=builder /app/deployed ./

# DB migration SQL files (available if worker runs migrations)
COPY --from=builder /app/packages/db/migrations ./migrations

# Bootstrap script
COPY --from=builder /app/apps/worker/bootstrap.js ./bootstrap.js

# nonroot is provided by the distroless image
USER nonroot

CMD ["bootstrap.js"]
