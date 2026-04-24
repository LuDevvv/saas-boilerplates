# Stage 1: Prune
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @node-stack/api --docker

# Stage 2: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter @node-stack/api...
RUN pnpm deploy --filter @node-stack/api --prod /app/deployed

# Stage 3: Runner (Distroless)
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV RUN_MIGRATIONS=true

# Copy deployed app (includes node_modules and built code)
COPY --from=builder /app/deployed ./
# Copy migrations from the full monorepo (pruned)
# Note: In a real monorepo, we might want to bundle migrations into the package
COPY --from=builder /app/out/full/packages/db/migrations ./migrations
# Copy the bootstrap script
COPY apps/api/bootstrap.js ./bootstrap.js

EXPOSE 4000

# Non-root user provided by the distroless image
USER nonroot

# Use the bootstrap script as the entrypoint
CMD ["bootstrap.js"]
