# Auditoría Técnica — `node-stack` boilerplate

**Auditor**: Principal Architect / Senior Security Engineer
**Fecha**: 2026-05-07
**Branch auditado**: `develop`
**Método**: Lectura directa de código + 5 agentes de exploración paralela + verificación cruzada de claims críticos.

> **Nota previa sobre verificación**: Algunos sub-agentes etiquetaron como "CRITICAL" hallazgos que verifiqué y resultaron exagerados. Esta auditoría final usa solo evidencia confirmada. Donde se corrige a un agente, se dice explícitamente (ver Apéndice).

---

## Veredicto ejecutivo (TL;DR)

Es un boilerplate **muy por encima del promedio** del mercado de "starters" de Node.js. La intención arquitectónica es correcta: monorepo con turbo + pnpm, NestJS + Drizzle, Outbox pattern, RLS, RBAC, 2FA, OAuth, OpenTelemetry, BullMQ, multi-tenant. Pero hay una **brecha consistente entre lo cableado y lo enforced**: muchas piezas de seguridad están definidas y luego quedan opcionales (RLS solo dentro de `withTransaction`, audit logs sin escritores, outbox processor presente pero acoplado a producer manual, soft-delete inconsistente). Es pre-producción, no production-grade.

**Score global: 6.7 / 10.** Tabla por área al final.

**Bloqueadores reales para producción**: 4 (todos arreglables en 1-2 días).
**Mejoras de alto impacto**: ~12 (sprint dedicado).

---

## 1. Arquitectura del Proyecto y Organización

### 1.1 Estado actual

- **Monorepo**: pnpm workspaces 9.0 + Turbo. `apps/{api,worker,dashboard,web}` + 17 `packages/*`. Project references TypeScript (`composite: true`).
- **Apps**: NestJS 11 (api), NestJS 11 (worker, BullMQ), React 19 + Vite 6 (dashboard), Next.js 15 App Router (web marketing).
- **Packages claves**: `@node-stack/db` (Drizzle), `@node-stack/cache` (Redis), `@node-stack/ui` (Radix + Tailwind), `@node-stack/api-client` (axios SDK con subpath exports), `@node-stack/outbox-queue`, `@node-stack/storage` (S3/MinIO), `@node-stack/billing-adapter` (Polar.sh), `@node-stack/ai-adapter` (OpenAI/Anthropic/OpenRouter), `@node-stack/emails` (React Email + SES), `@node-stack/notifications`, `@node-stack/services`, `@node-stack/validators` (Zod + nestjs-zod), `@node-stack/config`, `@node-stack/types`, `@node-stack/utils`, `@node-stack/queue`, `@node-stack/webhooks-utils`.
- **Config**: `.env.example` con ~50 keys; validación Zod en `@node-stack/config` ejecutada en `apps/api/src/main.ts` antes del bootstrap. ✓
- **Docker**: `Dockerfile` multi-stage (turbo prune → builder → distroless nonroot), `Dockerfile.dev` alpine + tsx watch. `docker-compose.yml` (postgres15, redis7, minio, pgadmin, jaeger, api, worker) y `docker-compose.production.yml` con PgBouncer, healthchecks node-based, log rotation, replicas.
- **CI/CD**: **No existe**. No hay `.github/workflows/`, ni Dependabot, ni CodeQL, ni Snyk, ni equivalente GitLab.

### 1.2 Strengths

- Project references y `tsc -b` configurados correctamente — los packages se buildean en orden topológico.
- Separación `apps` (deployables) vs `packages` (libs) clara.
- `@node-stack/config` con validación Zod previo al init de Nest → fail-fast.
- Producción Docker: distroless, nonroot, healthcheck Node-based (no curl), log rotation 10m × 3.
- Subpath exports en `@node-stack/api-client` y `@node-stack/utils` permiten tree-shaking parcial.

### 1.3 Weaknesses / Anti-patrones

- **Sin CI**. Para un boilerplate "production-ready", la ausencia de pipeline es la mayor inconsistencia narrativa. No corre tests, no chequea types, no audita deps, no escanea secrets en commits.
- **TypeScript strictness desigual**:
  - Root `tsconfig.json`: `strict: true` ✓ pero sin `noUncheckedIndexedAccess` ni `exactOptionalPropertyTypes`.
  - `apps/api/tsconfig.json`: `noImplicitReturns: false` (explícitamente desactivado, anti-patrón).
- **`packages/db/src/index.ts:8`**: `export const Database = {} as any;` — "dummy value for NestJS metadata". Es un workaround que sobrevive porque nadie lo invoca en runtime, pero es deuda. Igual que el `db = {} as Database` en línea 54.
- **Dead code**: `apps/api/src/common/maintenance/maintenance.controller.ts` existe como archivo pero **NO está declarado en `controllers: []` de `MaintenanceModule`** (verificado: `maintenance.module.ts` solo declara `providers/exports`). Sus rutas no se montan en runtime. *Esto contradice lo que reportó un sub-agente como CRITICAL.* No es vulnerabilidad — es código zombie confuso.
- Worker `Dockerfile` no tiene HEALTHCHECK (api sí).
- Sin `CODEOWNERS`, sin `CONTRIBUTING.md`, sin ADRs (Architecture Decision Records).

### 1.4 Performance / Scalability

- Pool DB compartido (`DB_POOL_MAX=10`) por instancia API → 2 réplicas × 10 + worker = 30 conexiones. PgBouncer en prod mitiga. ✓
- Worker desacoplado del API ✓.
- WebSockets con Redis adapter horizontal-ready ✓.

### 1.5 Recomendaciones (priorizadas)

| Prio | Acción |
|---|---|
| **Critical** | Crear `.github/workflows/ci.yml`: typecheck + lint + test + build matrix por package, en PRs. Activar Dependabot (`.github/dependabot.yml`). |
| High | Habilitar `noUncheckedIndexedAccess` en root tsconfig. Acepta el dolor inicial — atrapa accesos a `array[i]` sin guard. |
| High | Eliminar `Database = {} as any` y `db = {} as Database` (`packages/db/src/index.ts:8,54`). Usar DI estricta. |
| High | Borrar `MaintenanceController` o registrarlo correctamente con guard `@Roles(Role.SUPER_ADMIN)`. Hoy es trampa: invita a alguien a "engancharlo" sin revisar auth. |
| Medium | Agregar `HEALTHCHECK` al `Dockerfile` del worker (al menos consultar Redis). |
| Medium | Agregar workflow de "secret scanning" (gitleaks) en pre-commit y CI. |
| Low | Adoptar ADRs en `docs/adr/`. |

---

## 2. Capa de Base de Datos

### 2.1 Estado actual

- **Stack**: PostgreSQL 15 + Drizzle 0.45.2 + driver `pg` (node-postgres). `postgres` está como dep pero **no se usa** — borrar. Pool: max 10, idle 30s, connect 2s (`packages/db/src/database.module.ts:35-37`).
- **Schema**: 27 tablas en 14 archivos bajo `packages/db/src/schema/`. `users`, `sessions`, `workspaces`, `memberships`, `audit_logs`, `outbox`, `api_keys`, `subscriptions`, `customers`, `billing_events`, `notifications`, `tasks`, `tickets`, `files`, `webhook_endpoints`, `webhook_deliveries`, `inbound_webhook_logs`, `ai_logs`, `portability_requests`, `workspace_invitations`, `verification_tokens`, `accounts`, `oauth_accounts`, `system_config`, `waitlist`.
- **Migraciones**: 14 archivos commiteados (`migrations/0000`–`0013`). `drizzle.config.ts` con `MIGRATION_DATABASE_URL` separado de `DATABASE_URL` ✓.
- **Índices**: La mayoría de FKs y campos de filtrado están indexados (`idx_sessions_user_id`, `idx_outbox_processed_created_at` composite, `idx_audit_logs_workspace_created_at` composite, etc.).
- **RLS**: Migración `0012_enable_rls.sql` activa RLS en 9 tablas (`workspaces`, `memberships`, `audit_logs`, `api_keys`, `tasks`, `files`, `outbox`, `customers`, `subscriptions`) con políticas que dependen de `current_setting('app.current_workspace_id')`.

### 2.2 Strengths

- Multi-tenancy con `workspace_id` consistente en todas las tablas tenant-scoped.
- Outbox pattern con índices correctos para los queries de cleanup y de relay.
- Composite indexes razonados (`audit_logs(workspace_id, created_at)`, `outbox(processed, created_at)`).
- Repositorios usan el patrón `tx?: Tx` consistentemente para componer transacciones.
- No hay raw SQL en repos — todo Drizzle parameterizado. ✓

### 2.3 Weaknesses verificadas

| Hallazgo | Evidencia |
|---|---|
| **`files.userId` sin `onDelete` y sin índice** | `packages/db/src/schema/storage.ts:31-33` — `references(() => users.id)` sin opciones. Default es NO ACTION/RESTRICT → eliminar un usuario falla si tiene archivos. |
| **RLS está cableado solo dentro de `withTransaction()`** | `packages/db/src/index.ts:22-37` ejecuta `set_config('app.current_workspace_id', …, true)` solo en transacciones. Cualquier query que vaya directo al `db` (e.g. `repo.findMany(...)` fuera de tx) **NO tiene GUC seteado** → la política RLS rechaza la fila si `current_setting` es NULL (fail-closed). En la práctica esto significa que **muchos reads silenciosamente devuelven 0 filas** o **otros reads funcionan porque la política aún no está aplicada en esa tabla**. Mezcla peligrosa. |
| **`set_config` con interpolación de string** | `packages/db/src/index.ts:32`: ``sql.raw(`SELECT set_config('app.current_workspace_id', '${workspaceId}', true)`)`` — mitigado por regex UUID en línea 30, pero usar `set_config(name, value::text, true)` con bind params (`sql.raw` evita ese path) sería más seguro. Si alguien afloja la regex, hay SQLi. |
| **`AuthRepository.rotateSession`** | `packages/db/src/repositories/auth.repository.ts:143` hace `DELETE` + `INSERT` sin envolver en tx → ventana de inconsistencia. Hoy ya no se usa (tras el fix anterior), pero el método sigue exportado. |
| **Audit infrastructure presente pero subutilizada** | El schema `audit_logs` y `AuditLogRepository` existen, y hay un `AuditInterceptor` que emite eventos, pero búsquedas directas de `auditLogs` insert en flujos de auth/billing/admin no aparecen consistentemente. Acciones como password reset, 2FA on/off, role change pueden no quedar registradas. |
| **Sin soft-delete en `users` ni `workspaces`** | Hard delete cascada → no hay grace period ni recovery. Solo `tickets.deletedAt` existe. |
| **TOTP secrets en plaintext** | `packages/db/src/schema/users.ts` `twoFactorSecret` columna text sin pgcrypto. `ENCRYPTION_KEY` está en `.env.example` pero no veo uso al guardar el secret (`apps/api/src/auth/two-factor/two-factor.service.ts:51`). |
| **Sin partitioning ni retention** | `audit_logs`, `outbox`, `notifications`, `ai_logs` crecerán sin límite. No hay retention job ni partitioning declarativo. |
| **`users` sin índice en columnas que probablemente filtras** | Solo `idx_users_email`. Si filtrás por `role` o `created_at` en admin queries, full scan. |

### 2.4 Recomendaciones

| Prio | Acción |
|---|---|
| **Critical** | Arreglar `files.userId` con `onDelete: "set null"` + índice, antes de que aparezca en un postmortem. |
| **Critical** | Decidir RLS: o lo activás en TODAS las queries (envolver el repo `db` en un proxy que setee GUC en cada conexión vía `pool.on('connect')` o transacción implícita), o lo desactivás y dependés solo de filtros en queries. **El estado actual mixto es la peor opción**. |
| High | Encriptar `users.two_factor_secret` (pgcrypto o encriptación a nivel de aplicación con `ENCRYPTION_KEY` AES-GCM). |
| High | Agregar soft-delete a `users` y `workspaces` (`deleted_at` + grace period 30 días). |
| High | Empezar a escribir audit logs explícitamente en `auth.service.ts` para: password change, password reset, 2FA enable/disable, role change, session revoke. No depender solo del interceptor (capta requests, no eventos de dominio). |
| Medium | Política de retention: cron mensual que archive `audit_logs` >12 meses a tabla histórica o S3 (jsonl). Igual para `outbox` ya processed >7 días (parece haber ya un cleanup, pero verificar). |
| Medium | Eliminar `rotateSession` del repo (dead code post-fix). |
| Medium | Borrar la dep `postgres` de `package.json`. Solo `pg` se usa. |
| Medium | Cambiar `set_config` a forma con bind params: `tx.execute(sql\`SELECT set_config('app.current_workspace_id', ${workspaceId}, true)\`)`. |
| Low | `noUncheckedIndexedAccess` revelará accesos `result[0].id` que asumen no-undefined. |

### 2.5 Performance específico

- `outbox` y `audit_logs` indexados para los queries que veo, pero sin `BRIN` ni partitioning para series temporales — viable hasta ~100M filas, después degrada.
- Sin `pg_stat_statements` configurado o documentado para diagnóstico en prod.
- Sin read replicas configuradas (esperable en boilerplate; documentar como roadmap).

---

## 3. Backend API (NestJS)

### 3.1 Estado actual

15 módulos de dominio: `auth`, `workspaces`, `billing`, `storage`, `analytics`, `admin`, `realtime`, `notifications`, `ai`, `api-keys`, `tickets`, `portability`, `marketing`, `health`, `metrics`, `webhooks`. Guards globales: `JwtAuthGuard`, `CustomThrottlerGuard`, `WorkspaceGuard`, `RolesGuard`, `PermissionsGuard` (`apps/api/src/app.module.ts:133-137`). Interceptors globales: `IdempotencyInterceptor`, `AuditInterceptor`, `MetricsInterceptor`, `CacheInvalidationInterceptor`.

### 3.2 Strengths

- **Validación Zod-first** vía `nestjs-zod` con `createZodDto`, integrada con OpenAPI (`@ApiProperty`). Pipeline global con error format custom (422 estructurado, sin stack).
- **Prefijo global `api/v1`** con excludes para `/health`, `/billing/webhook`, `/api/docs` (`apps/api/src/main.ts:88-98`).
- **JwtAuthGuard global + `@Public()` decorator** — secure-by-default ✓.
- **RBAC con `Role` + `ROLE_HIERARCHY` + `ROLE_PERMISSIONS`** en `@node-stack/types`. `@Roles()` y `@RequirePermissions()` decoradores.
- **Rate limiting tier-aware**: el `CustomThrottlerGuard` lee `workspace.tier` cacheado y aplica límites distintos free/pro/enterprise.
- **Throttle por endpoint**: login `5/60s`, register `10/3600s`, 2fa `10/60s`. ✓
- **Logging estructurado** con nestjs-pino, trace_id/span_id de OTel inyectados en cada log.
- **Sentry + OTLP + Jaeger** todo cableado en `apps/api/src/tracing.ts` con beforeSend para strip PII.
- **Refresh in-place** (post-fix) — sin race conditions entre tabs.

### 3.3 Weaknesses verificadas

| Hallazgo | Evidencia | Severidad |
|---|---|---|
| **`AuthService` gordo (~600 LOC)** | `apps/api/src/auth/auth.service.ts` mezcla password reset, OAuth, sesiones, 2FA, JWT signing, profile updates. Debería partirse en `SessionService`, `PasswordService`, `OAuthService`, `TokenService`. | High DX |
| **Pagination inconsistente** | `notifications.service.ts:90` `limit: 50` hardcoded; `getAuthAuditLogs` `limit: 50` hardcoded; otros endpoints aceptan params. Sin DTO compartido. | Medium |
| **Mensajes de error en español hardcoded** | `apps/api/src/common/filters/http-exception.filter.ts:22,50` — "Error interno del servidor", "El recurso ya existe". Mata i18n del backend. | Medium |
| **Stack trace logueado a stdout** | Mismo filter `:89` — los logs de prod (pino JSON) van a aggregator y exponen paths internos. Sentry ya tiene stack. | Low (es obs) |
| **Outbox processor no garantiza ordering** | Múltiples workers procesan eventos en paralelo sin partitioning por agregado. `user.registered` antes que `user.profile_updated` no garantizado. | Medium |
| **Outbox: "marca como processed" después de dispatch a webhook** | Si el dispatcher falla post-DB-update, el evento queda como processed pero no llegó. | Medium |
| **Idempotency en jobs**: no veo idempotency key check en handlers, asume idempotencia del lado del consumer. | Asunción no documentada. | Medium |
| **API versioning solo via prefix** | Sin estrategia de deprecación, sin `Sunset` header, sin dual-version. | Low |
| **No hay magic-byte validation en uploads** | MIME y extensión validados, pero no firma. `apps/api/src/storage/storage.service.ts`. | Medium |
| **Body size limit no explícito** | `app.use(express.json())` sin `{ limit: '...' }`. | Medium |
| **`@nestjs/throttler` skip localhost** | `app.module.ts` `skipIf: ip === '127.0.0.1'` — si la app está detrás de proxy y `req.ip` es siempre localhost por mala config de `trust proxy`, todo el throttle se evita. Verificar `app.set('trust proxy', ...)`. | Medium |
| **Worker controllers (cron)** | `MaintenanceService` usa `@nestjs/schedule` en el API container, no en el worker. En multi-replica, el cron corre N veces — debe haber lock distribuido (Redis). | High |

### 3.4 Recomendaciones

| Prio | Acción | Ejemplo |
|---|---|---|
| **Critical** | Distributed lock para crons. Usar `redlock` o `@nestjs/schedule` + Redis-based mutex. Si tenés 2 réplicas API, hoy `purgeExpiredSessions` corre 2 veces por noche. | `if (await redis.set(lockKey, id, 'NX', 'EX', 300)) { await job() }` |
| **Critical** | Body size limit: `app.use(express.json({ limit: '100kb' }))` y `urlencoded({ limit: '100kb' })`. Subir solo si necesitás. | |
| High | Splitar `AuthService` en `SessionService` / `PasswordService` / `OAuthService` / `TokenService`. | |
| High | Pagination DTO compartido en `@node-stack/utils/pagination`: `{ cursor?, limit }` con max enforced. Aplicar a notifications, audit logs, listados. | |
| High | Magic-byte validation en uploads con `file-type`. Reject si MIME declarado no coincide con firma. | |
| High | `app.set('trust proxy', N)` con N = número de proxies (1 si solo nginx). Validar throttle no se salta. | |
| Medium | i18n de errores: cambiar `http-exception.filter.ts` a usar códigos (`AUTH_001`) y dejar `message` traducido en cliente. | |
| Medium | Outbox: marcar processed solo tras confirmar dispatch (transactional outbox completo). | |
| Medium | Documentar idempotency contract en outbox.types.ts. | |
| Medium | API versioning: agregar `Sunset` header para v1 cuando salga v2. | |
| Low | Borrar fallback `JWT_CONSTANTS.ACCESS_SECRET` usado en `auth.service.ts:519` — el config Zod ya valida, el fallback enmascara errores. | |

---

## 4. Frontend & Dashboard

### 4.1 Estado actual

**Dashboard (Vite 6 + React 19 + Router 7)**:

- Folder structure híbrida: `features/{auth,billing,tickets,admin,...}` + `pages/{_auth,_dashboard,_admin,_payments}` legacy + `components/{ui,shared,layout,charts,...}` + 6 stores Zustand + 15+ hooks sueltos + `app/{providers,router}`.
- TanStack Query 5.91 con `queryKeys` factory bien tipado, staleTime 5m, gcTime 30m, retry 1 query / 0 mutation.
- Auth: Zustand persist + `js-cookie` (secure HTTPS-only, sameSite=lax, 90d). Axios interceptor con silent refresh + redirect a `/auth/sign-in` en 401-tras-refresh.
- i18n: i18next + i18next-browser-languagedetector con `en` y `es`.
- PWA: `vite-plugin-pwa` activado.
- Real-time: Socket.IO cliente con `useRealtimeStore`, presencia, reconexión exponencial.
- ErrorBoundary class-based + react-hot-toast con `AppError` field-error mapping + ConnectivityStatus offline banner.

**Web (Next.js 15 App Router)**:

- 5 páginas (`/`, `/admin`, `/privacy`, `/terms`, `(app)/page`).
- TanStack Query + `fetcher` manual sin auth headers, sin 401 handling.
- **Sin middleware.ts** → `/admin` es público.

### 4.2 Strengths Dashboard

- Silent refresh con guarda anti-loop excelente (`apps/dashboard/src/lib/api/axiosInstance.ts:30-33`).
- `queryKeys` factory previene typos y facilita invalidación granular.
- CommandPalette con keyboard nav completa (↑↓ Enter Esc Cmd+K), aria-selected.
- Code splitting manual de vendors (recharts aislado).
- LanguageToggle con click-outside + focus management.

### 4.3 Weaknesses verificadas

| Hallazgo | Severidad | Evidencia |
|---|---|---|
| **`pages/` legacy duplicado con `features/`** | High DX | Misma feature está en dos lugares; nuevos devs confundidos. |
| **5+ `as any` en código de auth/admin** | High | `useAdmin.ts:18` `(response as any)?.data`; `SignUp.tsx:31` y `SignIn.tsx:38` `zodResolver(... as any)`; `useBilling.ts:29`. Síntoma de tipos generados mal alineados con runtime. |
| **`rememberMe` en SignIn no hace nada** | Medium | El checkbox existe en form pero no se usa para extender persistencia. |
| **RBAC solo a nivel ruta** | Medium | `adminGuard` chequea `user.role === "admin"` antes de renderizar. Componentes admin no tienen `if (canDo) ...`. Si la respuesta del API se demora, el usuario ve la UI de admin un instante antes del redirect. |
| **Cero tests** | High | vitest 0.25 (Feb 2023), sin specs, sin Playwright. Para un boilerplate "production-ready" es contradictorio. |
| **Web `/admin` sin protección** | Critical (si es destino real) | `apps/web/app/(app)/admin/page.tsx` no tiene `middleware.ts` ni server-side check. Si esa ruta debería ser admin-only, está abierta. Si es solo demo, dejarlo claro en README. |
| **Web `fetcher` sin auth** | High | `apps/web/lib/fetcher.ts` no envía Bearer ni hace refresh. Si esa app jamás necesita auth, OK; si la admin page la necesita, está rota. |
| **vite-plugin-pwa con config default** | Low | Sin runtime caching strategy explícito → ofrece poco más que offline-shell. |

### 4.4 Recomendaciones

| Prio | Acción |
|---|---|
| **Critical** | Decidir si `apps/web/app/(app)/admin` es prod o demo. Si es prod, agregar `middleware.ts` que valide JWT + role o eliminar la ruta. |
| **Critical** | Test baseline: 5 specs en vitest (login flow, refresh interceptor, ErrorBoundary, queryKeys, useTickets) + 2 e2e Playwright (login, create ticket). |
| High | Eliminar `pages/` legacy o moverlo bajo `features/legacy/` con TODO de migración. |
| High | Erradicar `as any` en auth/admin. Si los tipos del SDK no matchean, fix en `@node-stack/api-client`. |
| High | Implementar `rememberMe` o quitarlo del form. Hoy es UI mentirosa. |
| Medium | RBAC componente-level: `<IfRole role="admin">`. |
| Medium | Web: agregar `middleware.ts` para auth y `error.tsx` por route group. |
| Low | PWA: definir runtime caching para `/api/v1/auth/me` (NetworkFirst, 5s timeout). |

---

## 5. Type Safety & Code Quality

### 5.1 Estado actual

- TypeScript 5.7.3, `strict: true` root, `composite: true`.
- ESLint flat config con type-aware rules, `@typescript-eslint`, `import/order`. Husky 9 + lint-staged ejecuta `eslint --max-warnings 0 --fix` + prettier.
- Tipos compartidos via `@node-stack/types` (manual, no generado de OpenAPI).

### 5.2 Weaknesses

- **`noUncheckedIndexedAccess: false`** — perdés la verificación de bounds en arrays.
- **`exactOptionalPropertyTypes: false`** — `{ x?: string }` y `{ x: string | undefined }` se confunden.
- **`apps/api`**: `noImplicitReturns: false` explícitamente desactivado (`apps/api/tsconfig.json`).
- **Tipos compartidos manuales**: backend define DTOs en `@node-stack/validators` con Zod, frontend los re-importa. Si alguien cambia el schema y olvida exportar el `z.infer`, el front se queda con tipos viejos. **No hay generación de cliente desde OpenAPI** aunque Swagger está montado.
- **Sin `tsc --build --dry` en CI** (porque no hay CI).

### 5.3 Recomendaciones

| Prio | Acción |
|---|---|
| High | Activar `noUncheckedIndexedAccess`. |
| High | Generar SDK desde OpenAPI: `openapi-typescript` o `orval` corriendo en CI tras build del API → publica al package `@node-stack/api-client`. Erradica el desfase. |
| Medium | Activar `exactOptionalPropertyTypes`. |
| Medium | Activar `noImplicitReturns: true` en api. |

---

## 6. Performance & Scalability

### 6.1 Estado actual

- Bundle dashboard con manual chunks (react, query, ui, charts, state, forms).
- Prod: PgBouncer + 2 réplicas API (configurable).
- Caching: Redis vía `@node-stack/cache` con `getOrSet`. Workspace tier cache 24h.
- WebSockets con Redis adapter ✓.
- BullMQ procesando email/notifications/webhook/ai/outbox/dlq/system/portability.

### 6.2 Issues verificados

- **Cache invalidation interceptor existe globalmente** (`app.module.ts:130`) pero la implementación no la verifiqué a fondo. Riesgo de over-invalidation o under-invalidation.
- **Sin métricas de cache hit/miss expuestas**.
- **`maintenance.service.ts` cron en API multi-replica** — corre N veces (ya lo flaggué).
- **Audit interceptor emite eventos en cada write** — en alta carga, listener debe estar en cola, no in-process.
- **Bundle limit 500KB** — alto para mobile. Recharts es la víctima.
- **CDN / edge**: no hay assumptions de Cloudflare/Vercel; assets servidos por nginx local. Documentar para deploys edge.

### 6.3 Recomendaciones

- Cron con distributed lock (ya mencionado).
- Métricas Prometheus: `nestjs-otel` puede exportar histograms de cache + DB latency. No vi `/metrics` endpoint expuesto explícitamente.
- Considerar `@tanstack/react-table` con virtualización (`react-virtual`) para tablas admin.

---

## 7. Seguridad & Compliance

### 7.1 Hallazgos verificados (severidad consolidada)

| # | Severidad | Hallazgo | Evidencia | Fix |
|---|---|---|---|---|
| 1 | **HIGH** | `JWT_CONSTANTS` con fallback `""` (string vacío) | `apps/api/src/auth/constants.ts:16-18`. `auth.module.ts:27` y `auth.service.ts:519` los usan como fallback. Si `validateEnv` falla silently o se omite el módulo, firma con string vacío. | `throw new Error("JWT_SECRET required")` en validateEnv y borrar las constantes fallback. |
| 2 | **HIGH** | `JWT_REFRESH_SECRET` cae a `JWT_SECRET` | Mismo archivo. Refresh y access firman con el mismo secret → si access se filtra, refresh forgeable. | Validar ambos como required distintos. |
| 3 | **HIGH** | TOTP secret en plaintext | `apps/api/src/auth/two-factor/two-factor.service.ts:51` `set({ twoFactorSecret: secret })` directo. Dump de DB → atacante genera códigos válidos. | AES-GCM con `ENCRYPTION_KEY` (que ya existe en `.env.example`). |
| 4 | **HIGH** | Cron en API multi-replica sin lock | Ver §3.3. | Redis lock. |
| 5 | **HIGH** | `MaintenanceController` colgado | Verificado: archivo existe pero NO registrado en módulo. Hoy NO es exploit. Mañana, si alguien lo registra sin guard, es total takeover. | Borrar archivo o registrar con `@Roles(Role.SUPER_ADMIN)` + audit. |
| 6 | **MEDIUM** | RLS parcialmente enforced | §2.3. | Consistencia. |
| 7 | **MEDIUM** | TOTP sin replay protection | `two-factor.service.ts:57-71` — `epochTolerance: 30` pero sin tracking del código usado. | Cache Redis `2fa:used:{userId}:{code}` TTL 90s. |
| 8 | **MEDIUM** | CSP con `'unsafe-inline'` script y style | `apps/api/src/main.ts:61-71`. Si surge un XSS, no hay defensa en profundidad. | Nonces + `strict-dynamic`. |
| 9 | **MEDIUM** | Body parser sin limit | §3.3. | `{ limit: '100kb' }`. |
| 10 | **MEDIUM** | Magic-byte missing en uploads | §3.3. | `file-type`. |
| 11 | **MEDIUM** | Cache de API key validation 5min sin invalidación cross-instance documentada | `api-keys.service.ts`. Revoke borra el cache en la instancia que recibe el request, pero otras instancias mantienen el hit hasta TTL. | Pub/sub Redis para `api_key.revoked` + delete. |
| 12 | **MEDIUM** | OAuth callback construye redirect desde `FRONTEND_URL` | `auth.controller.ts:352-355,378-381`. Es operator-controlled (`getOrThrow`), no user-controlled, por lo que un sub-agente lo sobreestimó. **Pero**: si `FRONTEND_URL` se setea por error a un dominio externo, el `accessToken` viaja en query param → log leakage. | Validar `FRONTEND_URL` contra allowlist al startup; mejor: setear cookie HttpOnly en lugar de query param. |
| 13 | **MEDIUM** | Audit log sparse en flujos auth | §2.3. | Eventos explícitos. |
| 14 | **LOW** | Bcrypt cost 12 | Aceptable hoy, recomendado 13-14 en 2025+. | Subir a 13 cuando haya rotación. |
| 15 | **LOW** | Sin dependabot/snyk/codeql | §1.3. | Habilitar Dependabot. |
| 16 | **LOW** | Sin gitleaks pre-commit | §1.5. | Husky hook. |

### 7.2 Lo que SÍ está bien (importante reconocerlo)

- **API keys**: hashed con pepper + prefix preview + last-used tracking. Estado del arte ✓.
- **Audit redaction**: `audit.service.ts` redacta `password`, `token`, `secret`, `apiKey`, `credential`. ✓
- **Helmet con CSP definida** (aunque imperfecta).
- **CORS con whitelist explícita** (`CORS_ORIGINS`).
- **Cookies HttpOnly, Secure, SameSite=strict en prod**.
- **Sentry beforeSend strip PII** (email, ip).
- **Drizzle parameterizado** — sin SQLi vector.
- **Rate limit per-endpoint** sobre auth.
- **2FA + recovery codes en schema**.
- **`@Public()` opt-in, JwtAuthGuard global** — secure-by-default.

### 7.3 OWASP Top 10 (2021) Mapping

| OWASP | Estado |
|---|---|
| A01 Broken Access Control | ⚠ RLS parcial; component-level RBAC ausente. |
| A02 Cryptographic Failures | ⚠ TOTP plaintext; JWT fallback empty. |
| A03 Injection | ✓ Drizzle parameterizado; Zod validation. |
| A04 Insecure Design | ⚠ Maintenance dead controller; cron sin lock. |
| A05 Security Misconfiguration | ⚠ CSP unsafe-inline; body limit ausente. |
| A06 Vulnerable Components | ⚠ Sin Dependabot. Versions actuales OK al snapshot. |
| A07 Identification & Auth | ⚠ TOTP replay; sin lockout persistente. |
| A08 Data Integrity | ✓ Outbox transaccional; ⚠ ordering no garantizado. |
| A09 Logging & Monitoring | ✓ Sentry + OTel + audit interceptor; ⚠ audit en flujos auth incompleto. |
| A10 SSRF | ✓ No vi vector. AI/storage no exponen URLs user-controlled de fetch interno. |

---

## 8. Developer Experience & Maintainability

### 8.1 Strengths

- README con matriz de módulos clara, comandos quickstart, link a Postman collection y Swagger.
- `pnpm dev` levanta todo via Turbo.
- Generador de módulos en `scripts/generate-module.ts` (no examiné a fondo, pero su existencia es +).
- `docs/` con architecture, database, docker, observability, security, whitepaper.

### 8.2 Weaknesses

- **Sin Storybook** — `@node-stack/ui` no tiene catálogo navegable.
- **Sin CONTRIBUTING.md ni CODEOWNERS**.
- **Sin ADRs** — decisiones grandes (Drizzle vs Prisma, NestJS vs Fastify-only, Polar vs Stripe) sin contexto persistente.
- **README sin "Decisiones que ya tomé y no quiero discutir"** — útil para starter.
- **Comentarios en español + inglés mezclados** → en proyecto público, normalizar a inglés.

### 8.3 Recomendaciones

- Storybook 8 para `@node-stack/ui`.
- ADRs en `docs/adr/000X-titulo.md`.
- `CONTRIBUTING.md` con git flow + conventional commits.
- Ejemplo end-to-end: una feature "Tasks" completa documentada como referencia (algo así parece existir, pero verificar profundidad).

---

## 9. Recomendaciones Globales

### 9.1 Top 10 mejoras críticas (orden de impacto)

1. **CI pipeline** (`.github/workflows/ci.yml`): typecheck + lint + test + build matrix. Sin esto, ninguna otra mejora "stick".
2. **Distributed lock para crons** en `MaintenanceService`. Hoy con 2 réplicas se duplican tareas.
3. **Decidir RLS**: full enforcement (proxy de pool que setea GUC en cada acquire) o eliminar las políticas. El estado mixto es la peor opción.
4. **Borrar `MaintenanceController` huérfano** y/o registrarlo con guard explícito.
5. **Eliminar fallbacks JWT vacíos** + separar JWT_SECRET de JWT_REFRESH_SECRET con validación required.
6. **Encriptar TOTP secrets** con `ENCRYPTION_KEY` (AES-256-GCM).
7. **`files.userId` FK**: agregar `onDelete` + índice.
8. **Body parser limit**: `express.json({ limit: '100kb' })`.
9. **Test baseline**: 10 unit + 5 e2e Playwright cubriendo auth flows + admin.
10. **OpenAPI → SDK generation**: erradica `as any` y desfases front/back.

### 9.2 Roadmap

**Corto plazo (sprint 1-2, "MVP hardening")**

- Items 1-8 del Top 10.
- Magic-byte upload validation.
- Activar `noUncheckedIndexedAccess`.
- Web middleware.ts para `/admin` o eliminar la ruta.

**Medio plazo (mes 2-3, "scalability")**

- Items 9-10 del Top 10.
- Cache hit/miss metrics + Prometheus `/metrics`.
- Outbox: marcar processed solo post-dispatch confirmado + ordering por aggregate.
- API keys: pub/sub Redis para invalidación cross-instance.
- TOTP replay protection (Redis used-codes cache).
- Soft-delete users/workspaces.
- Audit logs explícitos en flujos auth/billing.

**Largo plazo (Q+, "enterprise readiness")**

- Particionamiento de `audit_logs`, `outbox`, `ai_logs` por mes.
- Read replicas + routing read/write.
- Storybook + design system docs.
- ADRs.
- SOC2 / ISO27001 controls mapping (audit logs, access reviews, key rotation).
- Multi-region strategy.

### 9.3 Score por área

| Área | Score | Justificación corta |
|---|---|---|
| 1. Arquitectura & Org | **7.5/10** | Monorepo bien hecho. Falta CI. |
| 2. Database | **6.5/10** | Schema sólido y migraciones limpias. RLS mixto y audit huérfano arrastran. |
| 3. Backend API | **7.5/10** | NestJS bien usado, RBAC + 2FA + outbox. AuthService gordo, cron sin lock. |
| 4. Frontend Dashboard | **7/10** | Auth refresh excelente, i18n, real-time. `pages/` legacy + cero tests + `as any`. |
| 4b. Frontend Web | **3.5/10** | Skeleton. `/admin` sin protección si es prod. |
| 5. Type Safety | **6.5/10** | strict on, pero strictness flags sub-óptimos. Sin SDK generado. |
| 6. Performance | **7/10** | Caching y queues bien. Sin métricas expuestas, cron duplicado. |
| 7. Seguridad | **6/10** | Buenas bases (helmet, CORS, cookies, rate limit, audit redaction). 4-5 issues HIGH reales. |
| 8. DX | **7/10** | README + docs decent. Falta Storybook + ADRs + CONTRIBUTING. |
| 9. Compliance | **5.5/10** | Audit infra subutilizada. Sin retention. PII parcialmente protegida. |

**Score global ponderado: 6.7 / 10** — *good boilerplate, no production-ready as-is*. Con 1-2 sprints dedicados a los items 1-10, sube a 8.5+.

---

## Apéndice: claims que se corrigieron de los sub-agentes

1. **"Maintenance endpoints completely unguarded — CRITICAL"** → Falso en runtime. Controller existe como archivo pero no registrado en módulo. Re-categorizado como dead code MEDIUM.
2. **"OAuth open redirect"** → Sobre-estimado. `FRONTEND_URL` es operator-controlled, no user-controlled. Bajado a MEDIUM (concern: token en query param).
3. **"Outbox processor missing"** → Falso. Existe en `apps/worker/src/processors/outbox.processor.ts`. Lo que sí falta es ordering guarantee y dispatch-confirm.
4. **"RLS not enforced anywhere"** → Falso. SÍ se enforce dentro de `withTransaction`. Lo correcto es: parcial / inconsistente.

Cada claim HIGH/CRITICAL fue verificado directamente con Read/Grep antes de incluirse en el reporte final.
