# Docker Infrastructure Documentation

## 1. Overview

The Node.js SaaS Backend uses Docker Compose for local development and can be deployed using Docker for production.

---

## 2. Development Stack

### 2.1 Docker Compose Configuration

```yaml
# docker-compose.yml
version: "3.8"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: ${PROJECT_NAME:-node-saas}-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-node_saas}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - node-saas-network

  # Redis for caching and queue
  redis:
    image: redis:7-alpine
    container_name: ${PROJECT_NAME:-node-saas}-redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - node-saas-network

  # MinIO for S3-compatible storage
  minio:
    image: minio/minio:latest
    container_name: ${PROJECT_NAME:-node-saas}-minio
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    ports:
      - "${MINIO_PORT:-9000}:9000"
      - "${MINIO_CONSOLE_PORT:-9001}:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - node-saas-network

  # API Application
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: ${PROJECT_NAME:-node-saas}-api
    ports:
      - "${API_PORT:-3000}:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-node_saas}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=${MINIO_ROOT_USER:-minioadmin}
      - MINIO_SECRET_KEY=${MINIO_ROOT_PASSWORD:-minioadmin}
      - JWT_SECRET=${JWT_SECRET:-change-me-in-production}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY:-change-me-in-production}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    volumes:
      - ./apps/api/src:/app/src
      - /app/node_modules
    networks:
      - node-saas-network
    command: pnpm run start:dev

  # Background Worker
  worker:
    build:
      context: .
      dockerfile: apps/worker/Dockerfile
    container_name: ${PROJECT_NAME:-node-saas}-worker
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-node_saas}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/worker/src:/app/src
      - /app/node_modules
    networks:
      - node-saas-network
    command: pnpm run start:dev

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  node-saas-network:
    driver: bridge
```

---

## 3. Environment Configuration

### 3.1 Development Environment Variables

```bash
# .env
# Project
PROJECT_NAME=node-saas

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=node_saas
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# MinIO
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# API
API_PORT=3000
NODE_ENV=development

# Security (change in production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ENCRYPTION_KEY=your-encryption-key-base64
```

### 3.2 Production Environment Variables

```bash
# .env.production
# Project
PROJECT_NAME=node-saas-prod

# Database (use cloud provider in production)
POSTGRES_USER=produser
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=node_saas_prod
POSTGRES_PORT=5432
DATABASE_URL=postgresql://produser:<secure-password>@db.example.com:5432/node_saas_prod

# Redis (use cloud provider in production)
REDIS_PORT=6379
REDIS_PASSWORD=<secure-password>
REDIS_URL=redis://:@redis.example.com:6379

# MinIO (use cloud provider in production)
MINIO_ENDPOINT=s3.example.com
MINIO_PORT=9000
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>

# API
API_PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=<secure-random-32-chars>
ENCRYPTION_KEY=<secure-random-base64>
```

---

## 4. Service Images

### 4.1 API Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/src ./apps/api/src
COPY packages ./packages

# Build TypeScript
RUN pnpm --filter @node-saas/api run build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "--filter", "@node-saas/api", "run", "start:prod"]
```

### 4.2 Worker Dockerfile

```dockerfile
# apps/worker/Dockerfile
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/worker/src ./apps/worker/src
COPY packages ./packages

# Build TypeScript
RUN pnpm --filter @node-saas/worker run build

# Start worker
CMD ["pnpm", "--filter", "@node-saas/worker", "run", "start:prod"]
```

---

## 5. Development Workflow

### 5.1 Starting the Stack

```bash
# Start all services
docker-compose up -d

# Start with logs
docker-compose up -d --follow

# Start specific service
docker-compose up -d postgres redis
```

### 5.2 Running Migrations

```bash
# Run migrations in container
docker-compose exec api pnpm db:migrate

# Create new migration
docker-compose exec api pnpm db:migrate:create migration_name
```

### 5.3 Seeding Data

```bash
# Seed database
docker-compose exec api pnpm db:seed
```

### 5.4 Accessing Services

| Service       | URL                   | Credentials           |
| ------------- | --------------------- | --------------------- |
| API           | http://localhost:3000 | -                     |
| PostgreSQL    | localhost:5432        | postgres/postgres     |
| Redis         | localhost:6379        | -                     |
| MinIO Console | http://localhost:9001 | minioadmin/minioadmin |

---

## 6. Production Deployment

### 6.1 Production Docker Compose

```yaml
# docker-compose.production.yml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      args:
        NODE_ENV: production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - MINIO_ENDPOINT=${MINIO_ENDPOINT}
      - MINIO_PORT=${MINIO_PORT}
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M

  worker:
    build:
      context: .
      dockerfile: apps/worker/Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    driver: overlay
    attachable: true
```

### 6.2 Deployment Commands

```bash
# Build images
docker-compose -f docker-compose.production.yml build

# Deploy
docker-compose -f docker-compose.production.yml up -d

# Scale services
docker-compose -f docker-compose.production.yml up -d --scale api=3 --scale worker=2

# View logs
docker-compose -f docker-compose.production.yml logs -f api
```

---

## 7. Troubleshooting

### 7.1 Common Issues

| Issue                    | Solution                                                       |
| ------------------------ | -------------------------------------------------------------- |
| PostgreSQL won't start   | Check volume permissions: `chown -R 1000:1000 ./postgres_data` |
| Redis connection refused | Ensure Redis is healthy: `docker-compose ps`                   |
| MinIO access denied      | Check credentials in environment variables                     |
| API can't connect to DB  | Ensure services are on same network                            |

### 7.2 Health Checks

```bash
# Check all services
docker-compose ps

# Check specific service health
docker-compose inspect postgres --format='{{.State.Health.Status}}'

# View logs
docker-compose logs postgres --tail=50
```

### 7.3 Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (full reset)
docker-compose down -v

# Remove images
docker-compose down --rmi local
```
