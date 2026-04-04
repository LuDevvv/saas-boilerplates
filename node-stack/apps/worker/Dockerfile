FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/worker ./apps/worker

RUN corepack enable pnpm && pnpm install --frozen-lockfile
RUN pnpm build --filter @node-stack/worker

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN corepack enable pnpm && pnpm install --production --frozen-lockfile || true

EXPOSE 3001

CMD ["node", "dist/main.js"]
