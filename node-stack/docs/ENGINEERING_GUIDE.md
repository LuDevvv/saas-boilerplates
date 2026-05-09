# Engineering Guide — node-stack boilerplate

> **Audiencia:** desarrolladores humanos y agentes de IA que trabajen en este repositorio.
> Este documento consolida todas las reglas, patrones y decisiones de diseño que aplican
> al proyecto completo. Léelo antes de tocar cualquier archivo.

---

## Tabla de contenidos

1. [Estructura del monorepo](#1-estructura-del-monorepo)
2. [Setup del entorno](#2-setup-del-entorno)
3. [Base de datos, RLS y transacciones](#3-base-de-datos-rls-y-transacciones)
4. [Audit logging](#4-audit-logging)
5. [Soft-delete y ciclo de vida de entidades](#5-soft-delete-y-ciclo-de-vida-de-entidades)
6. [Migraciones Drizzle](#6-migraciones-drizzle)
7. [API — NestJS (apps/api)](#7-api--nestjs-appsapi)
8. [Worker — BullMQ (apps/worker)](#8-worker--bullmq-appsworker)
9. [Dashboard — React (apps/dashboard)](#9-dashboard--react-appsdashboard)
10. [Paquete UI (@node-stack/ui)](#10-paquete-ui-node-stackui)
11. [Api-client (@node-stack/api-client)](#11-api-client-node-stackapi-client)
12. [Autenticación y sesiones](#12-autenticación-y-sesiones)
13. [Storage y validación de archivos](#13-storage-y-validación-de-archivos)
14. [Notificaciones](#14-notificaciones)
15. [Billing (Polar)](#15-billing-polar)
16. [Realtime (WebSockets)](#16-realtime-websockets)
17. [Lint y TypeScript](#17-lint-y-typescript)
18. [OpenAPI y generación de tipos](#18-openapi-y-generación-de-tipos)
19. [Commits y convenciones de git](#19-commits-y-convenciones-de-git)
20. [CI/CD — GitHub Actions](#20-cicd--github-actions)
21. [Problemas conocidos y workarounds](#21-problemas-conocidos-y-workarounds)
22. [Historial de fases de hardening](#22-historial-de-fases-de-hardening)

---

## 1. Estructura del monorepo

```
node-stack/
├── apps/
│   ├── api/          # Backend NestJS (Node16 ESM, Puerto 4000)
│   ├── worker/       # BullMQ processor workers
│   ├── dashboard/    # Frontend React + Vite + TypeScript
│   └── e2e/          # Playwright tests
├── packages/
│   ├── db/           # Drizzle ORM: schema, repos, migrations, RLS
│   ├── types/        # Interfaces y DTOs compartidos
│   ├── validators/   # Zod schemas + PaginationDto
│   ├── ui/           # Componentes React reutilizables (Radix + Tailwind)
│   ├── api-client/   # Axios client tipado + schema.ts generado
│   ├── auth/         # (reservado)
│   ├── billing-adapter/  # Abstracción Polar/Stripe
│   ├── ai-adapter/   # Anthropic + OpenAI + OpenRouter
│   ├── cache/        # Redis CacheService (ioredis)
│   ├── config/       # validateEnv con Zod
│   ├── emails/       # React-email templates + EmailSender
│   ├── notifications/    # NotificationService multi-canal
│   ├── outbox-queue/ # Patrón transactional outbox + BullMQ producer
│   ├── queue/        # Helpers de cola compartidos
│   ├── services/     # EncryptionUtils, PortabilityExporter, etc.
│   ├── storage/      # StorageService S3 + magic-bytes validator
│   ├── utils/        # Helpers: pagination, metrics, dates
│   └── webhooks-utils/ # HMAC signing y helpers de webhooks
├── docs/             # ADRs, guías de arquitectura
├── .github/workflows/ci.yml
├── eslint.config.mjs # Config ESLint unificada (ts + tsx)
├── turbo.json        # Pipeline Turborepo
└── pnpm-workspace.yaml
```

**Gestor de paquetes:** pnpm 9 con `shamefully-hoist=true`.
**Node:** ≥ 20. **TypeScript:** 5.7.x. **Module system:** `"module": "Node16"` en todo.

---

## 2. Setup del entorno

### Instalación

```bash
pnpm install
cp .env.example .env  # Completar todas las variables requeridas
```

### Variables de entorno críticas

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL con RLS habilitado |
| `REDIS_URL` | Redis para cache + BullMQ |
| `JWT_SECRET` | Min 32 chars |
| `JWT_REFRESH_SECRET` | Min 32 chars |
| `ENCRYPTION_KEY` | Hex 64 chars (256 bits) para TOTP |
| `POLAR_WEBHOOK_SECRET` | Secret para verificar webhooks de Polar |

### Desarrollo local

```bash
# API (con hot-reload):
pnpm --filter @node-stack/api dev:local

# Worker:
pnpm --filter @node-stack/worker dev:local

# Dashboard (Vite):
pnpm --filter @node-stack/dashboard dev
```

### Builds

```bash
# Construir todos los paquetes en orden (Turbo lo gestiona):
pnpm build

# Construir solo uno:
pnpm --filter @node-stack/api build
```

### Problemas con pnpm en Windows (Git Bash)

pnpm crea symlinks POSIX (`/c/Github/...`) en los `node_modules` locales de cada paquete.
Node.js nativo de Windows no puede resolver estos symlinks. Síntomas:

```
Error: Cannot find package '...packages/outbox-queue/node_modules/bullmq/dist/cjs/index.js'
```

**Workaround:**

```bash
pnpm install --force
```

Si persiste, verifica que el paquete NO sea una versión publicada sin dist (e.g. `bullmq@5.76.1`).
En ese caso actualiza la versión en `package.json` a una que sí tenga dist.

Paquetes que han tenido este problema:
- `bullmq@5.76.1` → usar `^5.76.6`
- `@nestjs/bullmq@11` → se crea stub manual en `node_modules/.pnpm/...`
- `@polar-sh/sdk@0.47.0` → usar dist stub o `pnpm install --force`

---

## 3. Base de datos, RLS y transacciones

### Regla cardinal: SIEMPRE usar los wrappers

**Nunca** ejecutes una query directamente sobre una tabla RLS-protegida fuera de un wrapper.
Una query sin wrapper retorna **0 rows** (fail-closed) o — si el GUC sangra entre llamadas —
**filtra datos entre tenants**.

```typescript
// ✅ CORRECTO — contexto de tenant
await withTenantTx(workspaceId, async (tx) => {
  await this.userRepo.findById(userId, tx);
  await this.auditLog.create({ ... }, tx);
}, db);

// ✅ CORRECTO — cron/admin/cross-tenant
await withSystemTx(async (tx) => {
  await this.workspaceRepo.hardDelete(id, tx);
}, db);

// ❌ INCORRECTO — bypass de RLS
await this.db.query.users.findFirst({ where: eq(...) });
```

### Tablas RLS-protegidas

`workspaces`, `memberships`, `audit_logs`, `api_keys`, `tasks`, `files`,
`outbox`, `customers`, `subscriptions`, `notification_settings`.

### Patrón de repositorios

Todos los métodos de repositorio aceptan `tx?: Tx`:

```typescript
class UserRepository {
  async findById(id: string, tx?: Tx): Promise<User | null> {
    const db = tx ?? this.db;
    return db.query.users.findFirst({ where: eq(schema.users.id, id) });
  }
}
```

### GUC de tenant

- `withTenantTx` fija el GUC `app.current_workspace_id` al `workspaceId` dado.
- `withSystemTx` usa el sentinel `system` que bypassa RLS.
- **Nunca** pases `workspaceId` de una llamada anterior. Extráelo de `req.workspace` (guard).

---

## 4. Audit logging

### Regla

Todo evento de dominio security-sensitive escribe una fila en `audit_logs`
**dentro de la misma transacción** que el write que lo origina:

```typescript
await withTenantTx(workspaceId, async (tx) => {
  await this.repo.update(id, data, tx);
  await this.auditLog.create({
    action: "auth.password_changed",  // Debe ser AuditAction
    userId,
    workspaceId,
    entityType: "user",
    entityId: id,
  }, tx);
}, db);
```

### Taxonomía de acciones

Las acciones válidas están en `packages/db/src/audit-actions.ts`.
**Nunca** inventes una nueva acción sin agregarla al array `AUDIT_ACTIONS`.

Dominios actuales: `auth.*`, `workspace.*`, `billing.*`, `admin.*`, `storage.*`.

### Redactor de metadatos

El `AuditService` tiene un redactor automático. **Nunca** pongas en `metadata`:
- `password`, `passwordHash`, `*Secret`, `*Token`, `apiKey`, `apiKeyHash`
- `sessionId` raw, números de tarjeta completos

---

## 5. Soft-delete y ciclo de vida de entidades

- `users` y `workspaces` tienen columna `deleted_at`.
- Los lookups por defecto **excluyen** filas soft-deleted.
- Para incluirlas: `{ includeDeleted: true }` — solo con razón justificada.
- El cron `MaintenanceService.hardDeleteExpiredAccounts` purga filas con `deleted_at` > 30 días.
- **Nunca** llames a hard-delete desde flujos de request (solo desde cron o admin).

---

## 6. Migraciones Drizzle

### Estado actual

Las migraciones 0012–0016 fueron escritas a mano (sin snapshots). El journal está en:
`packages/db/migrations/meta/_journal.json`.

### Antes de agregar una nueva migración

1. En un TTY local: `cd packages/db && pnpm db:generate`
2. Drizzle pedirá resolver conflictos de enums/columnas → elegir **"create"** para las ya existentes.
3. Commit solo los archivos `meta/0012_snapshot.json` ... `0016_snapshot.json` + `_journal.json`.
4. Si el run genera SQL nuevo, **bórralo** (ya existe el SQL manual).

### Escribir migración manual

Seguir el patrón de `0013–0016`:
- Un `.sql` con las sentencias
- Una entrada en `_journal.json`
- Sin snapshot (hasta que se reconcilien)

---

## 7. API — NestJS (apps/api)

### Estructura de `src/`

```
src/
├── admin/          # Controladores admin (super_admin required)
├── ai/             # AI chat/completion endpoints
├── analytics/      # Métricas de uso por workspace
├── api-keys/       # CRUD de API keys
├── auth/           # Login, register, OAuth, 2FA, sesiones
│   ├── services/   # TokenService, SessionService, PasswordService, OAuthService
│   └── strategies/ # Local, JWT, Google, GitHub, ApiKey
├── billing/        # Checkout, webhooks Polar, subscripciones
├── common/         # Guards, interceptors, filtros, middleware, decoradores
│   ├── decorators/ # @CurrentUser, @WorkspaceContext, @IsPublic, etc.
│   ├── filters/    # HttpExceptionFilter (maneja Zod, DB errors)
│   ├── guards/     # JwtAuthGuard, WorkspaceGuard, AdminGuard, etc.
│   ├── interceptors/ # AuditInterceptor, CacheInvalidationInterceptor
│   └── middleware/ # RequestContextMiddleware, TenantMiddleware
├── health/         # Endpoints de health check (Terminus)
├── marketing/      # Waitlist endpoint
├── metrics/        # Prometheus metrics
├── notifications/  # CRUD + send notifications
├── portability/    # GDPR data export
├── realtime/       # WebSocket gateway (Socket.IO + Redis adapter)
├── storage/        # Upload/download files (S3)
├── tickets/        # Sistema de soporte
├── users/          # Perfil usuario
├── webhooks/       # Inbound webhooks
└── workspaces/     # Multi-tenant workspace management
```

### Convenciones de controladores

```typescript
@Controller("auth")
@UseGuards(JwtAuthGuard)
@ApiTags("Auth")
@ApiBearerAuth("JWT-auth")
export class AuthController {
  // Retornar siempre un tipo explícito en el decorator de respuesta
  // y en la firma del método:
  @Post("login")
  @IsPublic()  // Bypass JWT
  async login(@Body() dto: LoginDto): Promise<AuthResponse> { ... }
}
```

### Obtener el usuario actual

```typescript
// En un método de controlador
@Get("me")
async me(@CurrentUser() user: UserPayload): Promise<UserEntity> { ... }
```

### Obtener el workspace actual

```typescript
// WorkspaceGuard ya valida membresía y pone req.workspace
@Get(":workspaceId/members")
async members(@WorkspaceContext() ws: WorkspaceContext): Promise<Member[]> { ... }
```

### Inyección del DB token

```typescript
import { DB_TOKEN } from "@node-stack/db";

@Injectable()
class MyService {
  constructor(@Inject(DB_TOKEN) private readonly db: Database) {}
}
```

### Cursor pagination

Para endpoints que listen colecciones grandes usar `PaginationDto`:

```typescript
@Get("sessions")
async getSessions(
  @CurrentUser() user: UserPayload,
  @Query() page: PaginationDto,
): Promise<PaginatedResponse<SessionListItem>> { ... }
```

`PaginationDto` está en `@node-stack/validators` y contiene `cursor?`, `limit`.
El cursor debe ser compuesto `(createdAt DESC, id DESC)` para estabilidad ante mutaciones.

### Orden de middleware en `main.ts`

1. Helmet (CSP) — primero
2. Cookie override seguro
3. Global prefix (`api/v1`)
4. Exception filter
5. Validation pipe (Zod)
6. Raw body parser para webhook
7. Swagger setup
8. CORS
9. JSON body parser
10. Compression
11. Listen

---

## 8. Worker — BullMQ (apps/worker)

### Estructura

```
src/
├── processors/
│   ├── ai.processor.ts          # Jobs de AI
│   ├── dlq.processor.ts         # Dead letter queue
│   ├── email.processor.ts       # Envío de emails
│   ├── event-handlers.ts        # Outbox event dispatchers
│   ├── notifications.processor.ts
│   ├── outbox.processor.ts      # Procesa outbox events
│   ├── outbox.writer.ts         # Escribe outbox a DB
│   ├── system.processor.ts      # Tareas de mantenimiento
│   ├── webhook.processor.ts     # Delivery de webhooks
│   └── webhook-dispatcher.service.ts  # HMAC + retry
├── base.worker.ts               # BaseWorker con logging
├── worker.module.ts
└── main.ts
```

### Patrón de processor

```typescript
interface MyJobData { entityId: string; }

@Processor("my-queue")
export class MyProcessor extends WorkerHost {
  async process(job: Job<MyJobData>): Promise<void> {
    const { entityId } = job.data;
    // ...
  }
}
```

### Outbox pattern

Los servicios del API escriben eventos a la tabla `outbox` dentro del mismo `withTenantTx`.
El `OutboxProcessor` del worker los lee y los despacha. Nunca hagas side-effects (emails,
webhooks) directamente en el request flow.

---

## 9. Dashboard — React (apps/dashboard)

### Stack

React 19, React Router 7, TanStack Query, Zustand, Axios, react-hook-form + Zod,
Tailwind CSS, Radix UI, Vite.

### Estructura de `src/`

```
src/
├── app/
│   ├── providers/   # QueryProvider, AuthProvider, ThemeProvider
│   └── router/      # Routes + route guards
├── components/
│   ├── layout/      # Navbar, Sidebar, Footer, Breadcrumbs
│   ├── shared/      # ErrorBoundary, LoadingState, EmptyState
│   └── ui/          # Re-exports de @node-stack/ui
├── features/        # Feature slices (auth, billing, storage, etc.)
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── index.ts
├── pages/           # Páginas top-level (auth, legal, onboarding)
├── stores/          # Zustand stores globales
└── utils/           # form-resolver, validations, helpers
```

### Consumir el API

```typescript
import { createClient, auth, workspace } from "@node-stack/api-client";

// Instanciar una vez en el provider
const client = createClient({
  baseURL: import.meta.env.VITE_API_URL,
  getToken: () => localStorage.getItem("accessToken"),
  getWorkspaceId: () => useWorkspaceStore.getState().currentId,
  onUnauthorized: () => { /* redirect to login */ },
});

// En hooks TanStack Query
const { data } = useQuery({
  queryKey: ["auth", "me"],
  queryFn: () => auth(client).me(),
});
```

### Tipos del API-client

Los tipos generados de OpenAPI están en `@node-stack/api-client`:

```typescript
import type { paths, operations, components } from "@node-stack/api-client";

// Tipo de respuesta de un endpoint específico
type LoginResponse = operations["AuthController_login"]["responses"]["201"]["content"]["application/json"];

// Schema de un componente
type UserEntity = components["schemas"]["UserEntity"];
```

### Estado de autenticación

`AuthProvider` en `app/providers/AuthProvider.tsx` gestiona:
- Token refresh automático
- Persistencia en `localStorage`
- `onUnauthorized` → redirect a `/login`

### Manejo de errores

El `AppError` del api-client (`packages/api-client/src/client.ts`) tiene:
- `.code` — código de error interno
- `.statusCode` — HTTP status
- `.fieldErrors` — validaciones Zod (status 422)

```typescript
try {
  await auth(client).login(data);
} catch (e) {
  if (e instanceof AppError && e.fieldErrors) {
    // Mapear errores a react-hook-form
  }
}
```

### `no-unsafe-*` en el dashboard

Los warnings `no-unsafe-*` están **desactivados** en el dashboard (override en `eslint.config.mjs`)
hasta que Phase 4c regenere los tipos del api-client. Una vez regenerados y el dashboard use
los tipos de `schema.ts`, se deben reactivar.

---

## 10. Paquete UI (@node-stack/ui)

### Uso

```typescript
import { Button, Input, DataTable, KPICard } from "@node-stack/ui";
```

### Convenciones de componentes

- Componentes con `forwardRef` devuelven tipos correctos (no `any`).
- Props de `icon` tipadas como `React.ReactNode | React.ElementType`.
- Funciones de helper como `getColor`, `getStrength` tienen tipo de retorno explícito.
- Componentes genéricos (e.g. `DataTable<T>`) usan `ColumnDef<T, unknown>` (no `any`).

### Hooks de animación

```typescript
import { useMotionAnimate, useGsapReveal } from "@node-stack/ui";

// useMotionAnimate — wrap de @motionone/dom con cleanup automático
const ref = useMotionAnimate((scope) => {
  return animate(scope, { opacity: [0, 1] }, { duration: 0.5 });
}, [trigger]);
```

### Importante: react-hooks v4 no soporta ESLint v9

Las reglas `react-hooks/rules-of-hooks` y `react-hooks/exhaustive-deps` están
**comentadas** en `eslint.config.mjs`. Se reactivarán cuando `eslint-plugin-react-hooks`
se actualice a v5+.

---

## 11. Api-client (@node-stack/api-client)

### Estructura

```
src/
├── client.ts    # createClient() — axios con interceptors
├── auth.ts      # Métodos de auth
├── workspace.ts # Métodos de workspace
├── billing.ts   # Métodos de billing
├── ai.ts        # Métodos de AI
├── storage.ts   # Métodos de storage
├── ...
├── schema.ts    # AUTO-GENERADO — openapi-typescript — NO EDITAR
└── index.ts     # Re-exports + export de schema types
```

### Regenerar el schema

Cada vez que cambien los endpoints del API:

```bash
# 1. Compilar el API
pnpm --filter @node-stack/api build

# 2. Exportar el spec (requiere DB dummy o real)
pnpm --filter @node-stack/api openapi:export
# Esto genera apps/api/openapi-spec.json

# 3. Generar los tipos TypeScript
pnpm --filter @node-stack/api-client generate:types
# Esto regenera packages/api-client/src/schema.ts

# 4. Commitear ambos archivos
git add apps/api/openapi-spec.json packages/api-client/src/schema.ts
```

### El CI verifica freshness

El job `generate-types` en CI regenera `schema.ts` del spec comprometido y falla si hay diff.
Asegúrate de commitear siempre ambos archivos juntos.

### El script de exportación requiere el API compilado

El script `apps/api/scripts/generate-openapi-spec.ts` espera `apps/api/dist/src/main.js`.
Si obtienes "API not compiled", primero: `pnpm --filter @node-stack/api build`.

---

## 12. Autenticación y sesiones

### Servicios (desde Phase 4b)

`AuthService` delega a 4 servicios especializados:

| Servicio | Responsabilidad |
|----------|-----------------|
| `TokenService` | JWT signing/verification, session expiry |
| `SessionService` | CRUD de sesiones, refresh, revocación |
| `PasswordService` | Validación, hash bcrypt (12 rounds), forgot/reset |
| `OAuthService` | Flujo Google/GitHub OAuth |

### Estrategias Passport

- `JwtStrategy` — verifica `accessToken`, inyecta `UserPayload` en `req.user`
- `JwtRefreshStrategy` — verifica `refreshToken` para el endpoint `/auth/refresh`
- `LocalStrategy` — valida email+password para `/auth/login`
- `GoogleStrategy` / `GitHubStrategy` — OAuth flows
- `ApiKeyStrategy` — valida `X-API-KEY` header

### Sesiones

- Las sesiones se almacenan en la tabla `sessions` (no en JWT).
- `getSessionExpiry`: 90 días con `rememberMe`, 30 días sin él.
- El refresh actualiza el token pero NO rota el `sessionId` (documentado: evita doble-refresh race).

### 2FA

- TOTP usando `otplib`.
- El secret se cifra con `TotpSecretCipher` (AES-256) antes de guardarse.
- Flujo: `enable2fa → verify2fa (activa) → login2fa (con temp_token)`.

---

## 13. Storage y validación de archivos

### Flujo de upload

1. Cliente solicita presigned URL → `POST /storage/presign`
2. Cliente sube directamente a S3 (no pasa por el API)
3. Cliente notifica al API → `POST /storage/confirm`
4. API descarga los primeros 4096 bytes del archivo
5. `verifyMagicBytes()` valida que el contenido coincida con el MIME declarado
6. Si falla: marca como `failed`, escribe `storage.upload_rejected` en audit, elimina de S3

### Magic bytes (`packages/storage`)

```typescript
import { verifyMagicBytes } from "@node-stack/storage";

const verdict = await verifyMagicBytes(buffer, declaredMimeType);
if (!verdict.ok) {
  // verdict.reason tiene la descripción del problema
}
```

- Usa `file-type@22` (ESM-only) para binarios.
- Fallback de scan de bytes imprimibles para `text/csv`, `text/plain`, `application/json`.
- `MAGIC_BYTES_PROBE_SIZE = 4096` bytes.

---

## 14. Notificaciones

### Canales soportados

`EMAIL`, `PUSH`, `IN_APP`

### Uso básico

```typescript
await this.notificationService.notify({
  userId,
  workspaceId,
  template: {
    name: "WELCOME",
    data: { name: "Juan", loginUrl: "https://..." }
  },
  channels: ["EMAIL", "IN_APP"],
});
```

### Templates de email

Definidos en `packages/emails/src/render.ts`:

```typescript
type EmailTemplate =
  | { name: "WELCOME"; data: { name: string; loginUrl: string } }
  | { name: "RESET_PASSWORD"; data: { token: string } }
  | { name: "VERIFY_EMAIL"; data: { token: string } }
  | { name: "AI_COMPLETED"; data: { jobId: string; message: string } };
```

### Preferencias de canal

El `IPreferenceProvider` permite que cada usuario configure qué canales quiere.
La implementación concreta vive en `apps/api/src/notifications/`.

---

## 15. Billing (Polar)

### Integración

El `BillingAdapter` en `packages/billing-adapter` abstrae al proveedor.
Actualmente soporta Polar y un `MockProvider` para tests.

### Webhooks

Los webhooks de Polar llegan a `/billing/webhook` (sin prefijo `api/v1`).
El body se parsea como raw (`express.raw`) y se verifica con HMAC usando
`POLAR_WEBHOOK_SECRET`.

Acciones de audit que se emiten:
- `billing.checkout_created`
- `billing.subscription_created`
- `billing.subscription_updated`
- `billing.subscription_canceled`

### Circuit breaker

`CircuitBreaker<TArgs, TResult>` en `billing-adapter` protege llamadas al proveedor externo.
Abre el circuito tras N fallos consecutivos y lo cierra tras un timeout.

---

## 16. Realtime (WebSockets)

### Setup

`RealtimeGateway` usa `socket.io` con `RedisIoAdapter` para escalar horizontalmente.

En producción (GENERATE_OPENAPI != true), el RedisIoAdapter se inicializa con `REDIS_URL`.

### Autenticación de sockets

El `WsJwtGuard` verifica el token JWT en `handshake.auth.token` antes de permitir
la conexión. El payload se adjunta a `socket.data.user`.

### Emitir eventos

```typescript
// Desde cualquier servicio (via EventEmitter)
this.eventEmitter.emit("realtime.user", { userId, event: "notification", data });

// Directo
this.realtimeService.emitToUser(userId, "event-name", payload);
this.realtimeService.emitToWorkspace(workspaceId, "event-name", payload);
```

---

## 17. Lint y TypeScript

### ESLint — reglas globales

Configuración en `eslint.config.mjs`:

| Regla | Nivel | Aplica a |
|-------|-------|----------|
| `no-explicit-any` | error | todos |
| `no-unsafe-assignment` | warn | todos |
| `no-unsafe-member-access` | warn | todos |
| `no-unsafe-call` | warn | todos |
| `no-unsafe-return` | warn | todos |
| `no-unused-vars` | error (con `^_` ignore) | todos |
| `explicit-function-return-type` | warn (`allowExpressions`) | todos |
| `no-console` | error (allow warn/error) | todos |
| `import/order` | error | todos |

### Overrides

- **`**/*.spec.ts`**: todas las reglas unsafe y return-type OFF, project: false
- **`apps/dashboard/**`**: unsafe-* y explicit-return-type OFF (hasta regenerar tipos con Phase 4c)
- **`packages/api-client/src/schema.ts`**: ignorado completamente (auto-generado)

### Convención anti-any

```typescript
// ❌ Nunca
const data: any = response.data;
function handler(req: any, res: any) {}

// ✅ Siempre
const data: unknown = response.data;
const typed = data as UserEntity;
function handler(req: Request & { user?: UserPayload }, res: Response) {}

// ✅ Para catch blocks
try { ... } catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
}
```

### Tipos explícitos de retorno (NestJS)

```typescript
// ✅
async createUser(dto: CreateUserDto): Promise<UserEntity> {}
async deleteUser(id: string): Promise<void> {}
onModuleInit(): void {}
canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {}
intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {}
```

### Tipos explícitos de retorno (React)

```typescript
// ✅
function MyComponent({ prop }: Props): JSX.Element { ... }
const MyComponent = ({ prop }: Props): JSX.Element => { ... };
const getColor = (pct: number): string => { ... };
const handleClick = (e: React.MouseEvent): void => { ... };
const fetchData = async (): Promise<void> => { ... };
```

### `--max-warnings 0`

Todos los scripts de lint del monorepo usan `--max-warnings 0`.
Un warning es un error para el CI.

### TypeScript — módulo Node16

El proyecto usa `"module": "Node16"` y `"moduleResolution": "Node16"`.
Consecuencias:
- Todos los imports deben incluir extensión `.js` (aunque el archivo sea `.ts`):
  ```typescript
  import { fn } from "./utils.js";  // ✅
  import { fn } from "./utils";      // ❌
  ```
- `import.meta` disponible en todos los archivos.
- Paquetes CJS (como `@nestjs/*`) se resuelven correctamente siempre que tengan
  su `dist/` con los archivos `.js` compilados.

---

## 18. OpenAPI y generación de tipos

### Flujo completo

```
API controllers
  → (GENERATE_OPENAPI=true)
  → main.ts escribe apps/api/openapi-spec.json
  → openapi-typescript
  → packages/api-client/src/schema.ts
  → export type { paths, operations, components }
  → dashboard usa los tipos
```

### Cuándo regenerar

Regenera `openapi-spec.json` + `schema.ts` cuando:
- Agregues o elimines un endpoint
- Cambies el cuerpo de request o response de un endpoint
- Cambies los tipos en `@node-stack/types` que se expongan en el API

### Comando

```bash
pnpm --filter @node-stack/api build                    # compilar primero
pnpm --filter @node-stack/api openapi:export           # genera openapi-spec.json
pnpm --filter @node-stack/api-client generate:types    # genera schema.ts
```

### Swagger decoradores recomendados en controladores

```typescript
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() dto: LoginDto): Promise<AuthResponse> { ... }
}
```

---

## 19. Commits y convenciones de git

### Formato

```
<tipo>(<scope>): <descripción en inglés>

<cuerpo opcional>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Tipos

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat` | Nueva funcionalidad |
| `fix` | Bug fix |
| `chore` | Mantenimiento (lint, deps, config) |
| `refactor` | Reestructuración sin cambio de comportamiento |
| `docs` | Solo documentación |
| `test` | Solo tests |
| `perf` | Mejora de performance |
| `ci` | Cambios en CI/CD |

### Scopes comunes

`api`, `worker`, `dashboard`, `db`, `ui`, `api-client`, `repo`, `packages`

### Reglas estrictas

- **Un topic por commit**. No mezcles lint + feature + bug fix.
- **English** en mensajes de commit. Las strings `AUTH_ERRORS` se mantienen en español.
- **Nunca** `git add -A` o `git add .`. Siempre pathspecs explícitos.
- **Nunca** `--no-verify` excepto si el hook mismo está roto.
- **Nunca** force-push a `main` o `develop`.
- Antes de hacer push: `git pull --rebase origin develop`.

### Staging correcto

```bash
git add apps/api/src/auth/auth.service.ts packages/db/src/repositories/user.repository.ts
# NO: git add -A
# NO: git add .
```

---

## 20. CI/CD — GitHub Actions

### Jobs

| Job | Qué hace |
|-----|----------|
| `lint-typecheck` | `pnpm lint` + `pnpm typecheck` |
| `test` | Unit tests (Vitest) |
| `build` | Matrix build de api, worker, dashboard, web |
| `test-e2e` | Playwright con Postgres + Redis reales |
| `generate-types` | Verifica que `schema.ts` esté actualizado |
| `secret-scanning` | Gitleaks |

### Pre-commit hook

`node-stack/.husky/pre-commit` ejecuta:

```bash
NODE_OPTIONS=--max-old-space-size=8192 npx tsc -b apps/api/tsconfig.json --noEmit
NODE_OPTIONS=--max-old-space-size=8192 npx tsc -b apps/worker/tsconfig.json --noEmit
```

El heap de 8192 MB es necesario por el grafo cross-package de TypeScript.
Si el hook falla: primero diagnostica, no uses `--no-verify`.

### Heap en CI

```yaml
env:
  NODE_OPTIONS: --max-old-space-size=8192
```

Configurado en los jobs de typecheck y build.

---

## 21. Problemas conocidos y workarounds

### Paquetes npm publicados sin dist

Algunos paquetes de npm (especialmente versiones patch recientes) se publican sin sus
archivos compilados. Síntoma:

```
Error: Cannot find module '.../@nestjs/bullmq/dist/index.js'
```

**Solución inmediata:**

```bash
pnpm install --force
```

Si persiste después del force install, el paquete en sí está roto en npm.
Opciones:
1. Bajar a una versión anterior que sí tenga dist
2. Crear un stub manual en `node_modules/.pnpm/<pkg>/node_modules/<pkg>/dist/`

**Paquetes afectados históricamente:**
- `@nestjs/bullmq@11.0.x` — stub creado en `dist/index.js` usando `@nestjs/bull-shared`
- `@polar-sh/sdk@0.47.0` — usa `pnpm install --force` para obtener el dist
- `bullmq@5.76.1` — publicado sin dist, usar `^5.76.6`

### TypeScript Node16 + paquetes NestJS

Con `"module": "Node16"`, TypeScript resuelve `@nestjs/swagger` a `@nestjs/swagger/index.js`.
Si la resolución falla con `Module has no exported member 'ApiTags'`:

1. Verificar que el paquete tiene `dist/` completo
2. Si persiste, correr `pnpm install --force` para refrescar el pnpm store

### Symlinks POSIX en Windows

pnpm crea symlinks con rutas POSIX en `packages/*/node_modules/`.
Node.js nativo de Windows puede no resolverlos. Ver sección 2.

### Drizzle migrations sin snapshots

Las migraciones 0012-0016 no tienen archivos snapshot en `meta/`.
`drizzle-kit generate` falla en entornos no-TTY por los prompts de enum resolver.
Solución: generarlas en un TTY local interactivo. Ver sección 6.

### Spec de OpenAPI requiere API compilado

El script `generate-openapi-spec.ts` requiere `apps/api/dist/src/main.js`.
Si obtienes errores de módulo no encontrado al generar el spec, compilar primero:

```bash
pnpm --filter @node-stack/api build
```

### ESLint + `react-hooks` v4 + ESLint v9

`eslint-plugin-react-hooks@4.x` usa la API `context.getSource` que fue removida en ESLint v9.
Las reglas `rules-of-hooks` y `exhaustive-deps` están comentadas en `eslint.config.mjs`.
Al actualizar a `eslint-plugin-react-hooks@5+`, descomentar.

---

## 22. Historial de fases de hardening

### Phase 1 — Security hardening (commits ee4b3f5..8b920d2)

- Implementación de RLS en PostgreSQL
- `withTenantTx` / `withSystemTx` wrappers
- JWT + sesiones persistentes
- Bcrypt 12 rounds

### Phase 2 — RLS + Audit infra + CI (commits 84a89fc..)

- `AuditLogRepository` + taxonomía de acciones
- `AuditService` con redactor de datos sensibles
- CI con typecheck + lint
- Soft-delete en users/workspaces

### Phase 2.5 — Route RLS-table reads

- Todos los reads de tablas RLS pasan por wrappers

### Phase 3 — Sustainability

- `MaintenanceService` para hard-delete tras 30 días
- Tests unitarios baseline

### Phase 4a — Lint baseline (2260 → 0 problemas)

- `eslint.config.mjs` unificado para `.ts` + `.tsx`
- Todos los paquetes: `--max-warnings 0`
- `no-explicit-any` eradicado, typed interfaces por dominio
- Express request interfaces tipadas por guard/middleware
- Spec files excluidos de typed-linting (`parserOptions.project: false`)
- Dashboard override temporal para `no-unsafe-*`

### Phase 4b — AuthService split

- `AuthService` (800 LOC → 458 LOC) + 4 servicios especializados
- Unit specs para TokenService, SessionService, PasswordService, OAuthService

### Phase 4c — OpenAPI → SDK auto-generation

- `GENERATE_OPENAPI=true` → escribe spec y sale limpio
- `openapi-typescript` genera `schema.ts` (5117 líneas, 97 endpoints)
- Re-exporta `paths`, `operations`, `components` desde api-client
- CI job `generate-types` verifica freshness del schema

### Phase 4d — Gap close

- `file-type@22` para validación de magic bytes (reemplaza tabla manual)
- Cursor pagination compuesto `(createdAt DESC, id DESC)` en sessions/audit-logs

---

## Apéndice: Glosario rápido

| Término | Definición |
|---------|------------|
| `withTenantTx` | Wrapper que fija RLS al workspace del request |
| `withSystemTx` | Wrapper que bypassa RLS para admin/cron |
| `Tx` | Tipo de transacción Drizzle (`NodePgDatabase<typeof schema>`) |
| `AuditAction` | Union type de las acciones permitidas en audit_logs |
| `UserPayload` | JWT decoded payload inyectado por JwtStrategy en req.user |
| `WorkspaceContext` | Info del workspace + membresía inyectada por WorkspaceGuard |
| `PaginationDto` | `{ cursor?: string; limit?: number }` de @node-stack/validators |
| `PaginatedResponse<T>` | `{ data: T[]; nextCursor: string \| null }` |
| `OutboxEvent` | Registro en tabla `outbox` para side-effects asíncronos |
| `schema.ts` | Tipos OpenAPI auto-generados — nunca editar manualmente |
| `GENERATE_OPENAPI` | Env var que activa el modo de generación de spec |
