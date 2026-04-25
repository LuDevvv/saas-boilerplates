---
trigger: always_on
---

# 🧊 Frozen Infrastructure & Configuration Policy

> [!IMPORTANT]
> This document defines the "Frozen" state of the NodeStack infrastructure. As of April 2026, the Docker, Worker, and API core configurations have reached 100% stability. **DO NOT MODIFY THESE FILES WITHOUT EXPLICIT ARCHITECTURAL APPROVAL.**

## 🚫 Restricted Files & Directories

The following configurations are strictly protected to prevent regression in the development and production environments:

### 1. Build & Compiler Configs
- **`tsconfig.json` (Root & Packages)**: TypeScript paths, strictness, and output targets are tuned for monorepo compatibility.
- **SWC Configuration**: Any changes to `.swcrc` or `unplugin-swc` settings in Vitest/API will break the ESM-based runtime.
- **`turbo.json`**: Cache keys, task dependencies, and pipeline outputs are optimized for remote caching.

### 2. Dependency Management
- **`package.json` Scripts**: The build, dev, and migration scripts are coupled with Docker and CI pipelines.
- **`pnpm-workspace.yaml`**: Monorepo scope and package discovery.
- **`.npmrc`**: Hoisting and dependency resolution settings.

### 3. Docker & Infrastructure
- **`docker-compose.yml` & `docker-compose.production.yml`**: Port mappings (4000 for API, etc.), network aliases, and volume persistence.
- **Dockerfiles (`Dockerfile`, `Dockerfile.dev`)**: Multi-stage pruner and **Distroless** runner settings. These are security-hardened.
- **`.dockerignore`**: Prevents leaking sensitive `.env` or large `node_modules` into image layers.

### 4. Database Core
- **`packages/db/migrations/`**: Do not edit existing SQL files. Only add new migrations via `db:generate`.
- **`packages/db/src/context/`**: The RLS automation and AsyncLocalStorage core logic.

## 🛠️ When can I modify these?

Changes are only permitted if:
1. A new service is being added that requires new infrastructure (e.g., a new microservice).
2. A critical security vulnerability is found in a base image or dependency.
3. The underlying OS or Node.js version reaches End-of-Life (EOL).

## ⚠️ Violation Consequence
Any PR modifying these files without passing the specialized infrastructure integration tests (`pnpm test:integration`) or without an explicit `infra:` tag in the commit will be automatically rejected.

---
*Last Updated: April 24, 2026*
*Status: FROZEN*
