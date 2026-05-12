# ── Stage 1: Prune — strip the monorepo to only what @node-stack/api needs ─────
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @node-stack/api --docker

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

# Install sharp for server-side thumbnail generation (native binary for linux/amd64)
RUN npm install --prefix /usr/local sharp

# Source + compile
# After this COPY, files land at /app/apps/api/, /app/packages/db/, etc.
COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter @node-stack/api...

# Deploy production deps to a clean directory
RUN pnpm deploy --filter @node-stack/api --prod /app/deployed

# Copy sharp into the deployed node_modules (native binary, not part of pnpm deploy)
RUN cp -r /usr/local/node_modules/sharp /app/deployed/node_modules/sharp

# ── Stage 3: Runner — minimal distroless image ────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV RUN_MIGRATIONS=true

# Deployed app: production node_modules + built code
COPY --from=builder /app/deployed ./

# DB migration SQL files (consumed by migrate.js at runtime)
COPY --from=builder /app/packages/db/migrations ./migrations

# Bootstrap script (runs migrations then starts the app)
COPY --from=builder /app/apps/api/bootstrap.js ./bootstrap.js

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:4000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]

# nonroot is provided by the distroless image
USER nonroot

CMD ["bootstrap.js"]
