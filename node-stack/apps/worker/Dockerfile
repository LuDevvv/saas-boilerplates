# Stage 1: Prune
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @node-stack/worker --docker

# Stage 2: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter @node-stack/worker...
RUN pnpm deploy --filter @node-stack/worker --prod /app/deployed

# Stage 3: Runner (Distroless)
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV RUN_MIGRATIONS=false

# Copy deployed app
COPY --from=builder /app/deployed ./
# Copy migrations (if needed by worker)
COPY --from=builder /app/out/full/packages/db/migrations ./migrations
# Copy the bootstrap script
COPY apps/worker/bootstrap.js ./bootstrap.js

# Non-root user
USER nonroot

# Use the bootstrap script as the entrypoint
CMD ["bootstrap.js"]
