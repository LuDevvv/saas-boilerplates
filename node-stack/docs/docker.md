# Docker Infrastructure Documentation

## 1. Overview

The Node Stack uses Docker for local development orchestration and containerized production deployments. The development environment is optimized for **live-reloading** across a monorepo while protecting against host-to-container filesystem conflicts (especially important for Windows/Mac hosts).

---

## 2. Development Stack

### 2.1 Services
| Service | Image | Ports | Purpose |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `postgres:15-alpine` | `5432` | Primary ACID database. |
| **Redis** | `redis:7-alpine` | `6379` | Caching, Rate Limiting, and BullMQ jobs. |
| **MinIO** | `minio/minio` | `9000`, `9002` | S3-compatible object storage for local testing. |
| **Jaeger** | `jaegertracing/all-in-one` | `16686` | Distributed tracing (OpenTelemetry). |
| **pgAdmin** | `dpage/pgadmin4` | `5050` | Database GUI. |
| **API** | `NestJS (Custom)` | `4000` | The primary REST gateway. |
| **Worker** | `NestJS (Custom)` | - | Background job processor. |

### 2.2 Volume Strategy (Monorepo)
To ensure fast development on Windows/Mac, we use **Named Volumes** for `node_modules`. This prevents host symlinks from breaking inside the Linux container:
- `. : /app`: Bind-mount for source code (allows live reload).
- `api_node_modules`: Named volume to store Linux-native dependencies.

---

## 3. Environment Configuration

The system uses a layered environment strategy:
1.  **`.env`**: Global project settings.
2.  **`apps/api/.env`**: API-specific secrets (JWT, OAuth).

### 3.1 Core Variables
| Variable | Description | Default (Dev) |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string. | `postgresql://app_user:changeme@postgres:5432/app` |
| `REDIS_URL` | Redis connection string. | `redis://redis:6379` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Jaeger trace collector. | `http://jaeger:4318/v1/traces` |
| `MINIO_ROOT_USER` | MinIO Access Key. | `minioadmin` |

---

## 4. Operational Commands

### 4.1 Development
```bash
# Start the full stack
docker compose up -d

# View logs for a specific service
docker compose logs -f api

# Rebuild images after changing package.json
docker compose up -d --build

# Hard reset (clears DB and node_modules volumes)
docker compose down -v
```

### 4.2 Production
For production, we use multi-stage Dockerfiles (`apps/api/Dockerfile`) that:
1.  **Prune** devDependencies.
2.  **Compile** TypeScript to ESM.
3.  **Optimize** the image size using Alpine Linux.

---

## 5. Troubleshooting

- **Node Modules mismatch**: If you install a new package on your host, you MUST run `docker compose up -d --build` to update the named volumes.
- **Port conflicts**: If port `5432` or `6379` is already taken on your machine, change the host mapping in `docker-compose.yml`.
- **Health Checks**: The `api` and `worker` services wait for `postgres` to be "healthy" before starting, preventing early connection failures.
