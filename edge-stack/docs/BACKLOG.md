# 📋 Backlog Completo: Edge Stack → 10/10

> Auditoría exhaustiva generada el 4 de marzo, 2026.  
> Cada tarea es **independiente**, con scope claro, archivos involucrados, y criterio de aceptación.

---

## 🔑 Leyenda

| Etiqueta       | Significado                                        |
| -------------- | -------------------------------------------------- |
| 🟢 `Quick Win` | < 30 min, alto impacto visual o funcional          |
| 🟡 `Medium`    | 1-3 horas, requiere diseño o lógica moderada       |
| 🔴 `Heavy`     | > 3 horas, feature completa o refactor profundo    |
| `[BE]`         | Backend (apps/api, packages/services, packages/db) |
| `[FE]`         | Frontend (apps/web)                                |
| `[DX]`         | Developer Experience (CI, tooling, config)         |
| `[PKG]`        | Shared Package (packages/\*)                       |

---

## 1. 🧪 Testing (Actual: 40% → Meta: 90%)

> El gap más crítico. Un boilerplate production-ready sin tests es inaceptable.

### ~~T-001: Tests para BillingService~~ ✅ DONE `[BE]`

- **Scope**: `packages/services/src/modules/billing/billing.service.ts`
- **Qué testear**:
  - `syncSubscription()` — upsert customer + subscription
  - `getSubscriptionStatus()` — workspace con suscripción activa, sin suscripción, trial
  - `getCustomerPortalUrl()` — success, no customer, no subscription
  - `normalizeLemonSqueezyPayload()` — mapeo correcto de campos
  - `normalizeCreemPayload()` — mapeo correcto de campos
- **Tipo**: Logic Pool (`billing.service.test.ts`)
- **Dependencia**: `createTestDb()` de `@workspace/testing`
- **Criterio**: ≥ 8 test cases, 100% branches cubiertos en syncSubscription

### ~~T-002: Tests para MetricsRepository~~ ✅ DONE `[BE]`

- **Scope**: `packages/db/src/repositories/metrics.repository.ts`
- **Qué testear**:
  - `getDashboardMetrics()` — workspace vacío (zeros), workspace con datos, parallel execution
- **Tipo**: Logic Pool (`metrics.repository.spec.ts`)
- **Criterio**: 3 test cases mínimo

### ~~T-003: Tests de integración para endpoints Billing~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/modules/billing/`
- **Qué testear**:
  - `POST /api/billing/checkout` — request válido, sin workspace, sin auth
  - `GET /api/billing/subscription` — con suscripción, sin suscripción
  - `POST /api/billing/portal` — con customer, sin customer
  - `POST /api/billing/webhook` — firma válida, firma inválida, payload malformado
- **Tipo**: Edge Pool (`billing.test.ts`)
- **Criterio**: ≥ 8 test cases

### ~~T-004: Tests de integración para endpoints Metrics~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/modules/metrics/`
- **Qué testear**:
  - `GET /api/metrics/dashboard` — autenticado + workspace, sin auth (401), sin workspace (400)
- **Tipo**: Edge Pool (`metrics.test.ts`)
- **Criterio**: 3 test cases

### ~~T-005: Tests para middleware permissionGuard~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/common/middlewares/permissionGuard.ts`
- **Qué testear**:
  - Usuario con permiso correcto (pass)
  - Usuario sin permiso (403)
  - Sin permissions en contexto (403)
- **Tipo**: Edge Pool (`permissionGuard.test.ts`)
- **Criterio**: 3 test cases

### ~~T-006: Tests para middleware workspaceGuard~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/common/middlewares/workspaceGuard.ts`
- **Qué testear**:
  - Header `x-workspace-id` presente y válido
  - Header ausente (400)
  - Usuario no es miembro del workspace (403)
- **Tipo**: Edge Pool (`workspaceGuard.test.ts`)
- **Criterio**: 3 test cases

### ~~T-007: Tests para webhook signature verification~~ ✅ DONE `[BE]`

- **Scope**: `packages/services/src/modules/billing/providers/`
- **Qué testear**:
  - LemonSqueezy: firma válida → true, firma inválida → false, firma vacía → false
  - Creem: firma válida → true, firma inválida → false, cuerpo modificado → false
- **Tipo**: Logic Pool (ya existen parcialmente en `creem.test.ts` y `lemonsqueezy.test.ts`)
- **Criterio**: Verificar cobertura actual y completar branches faltantes

### ~~T-008: Tests para AuthService completo~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/modules/auth/auth.service.spec.ts`
- **Qué testear** (ampliar los existentes):
  - 2FA: enable, verify, disable
  - OAuth: link account, login con cuenta existente, login sin cuenta
  - Token refresh flow
  - Password reset: generate token, validate token, reset password
- **Criterio**: ≥ 12 test cases totales

### ~~T-009: Tests para InvitationService~~ ✅ DONE `[BE]`

- **Scope**: `packages/services/src/modules/workspaces/invitation.service.ts`
- **Qué testear**:
  - Crear invitación, aceptar invitación, revocar, token expirado, máximo de invitaciones
- **Criterio**: ≥ 5 test cases

### ~~T-010: Tests para Jobs Worker~~ ✅ DONE `[BE]`

- **Scope**: `apps/jobs-worker/src/`
- **Tests implementados**:
  - `render.spec.ts` — Verifica renderizado exitoso de todos los templates y error en desconocidos
  - `index.spec.ts` — Verifica lógica de Queue batching, reintentos en errores de Red y ack en payloads corruptos
- **Criterio**: 100% de cobertura en la lógica de procesamiento de emails

---

## 2. ⚙️ DevOps & CI/CD (Actual: 75% → Meta: 95%)

### ~~T-011: GitHub Actions CI Pipeline~~ ✅ DONE `[DX]`

- **Crear**: `.github/workflows/ci.yml`
- **Jobs**:
  - `lint`: `pnpm lint` across monorepo
  - `typecheck`: `pnpm typecheck` (tsc --noEmit per package)
  - `test-logic`: Logic pool tests (Node.js)
  - `test-edge`: Edge pool tests (Miniflare)
- **Trigger**: On PR to `main` y `develop`
- **Cache**: pnpm store + turbo cache
- **Criterio**: Green pipeline en PR con todos los jobs passing

### ~~T-012: GitHub Actions Deploy Pipeline~~ ✅ DONE `[DX]`

- **Crear**: `.github/workflows/deploy.yml`
- **Jobs**:
  - `deploy-api`: `cd apps/api && wrangler deploy`
  - `deploy-jobs`: `cd apps/jobs-worker && wrangler deploy`
  - Web se despliega automáticamente via Cloudflare Pages Git integration
- **Trigger**: On push to `main`
- **Secretos necesarios**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- **Criterio**: Deploy automático post-merge a main

### ~~T-013: Crear `.env.example`~~ ✅ DONE `[DX]`

- **Crear**: `.env.example` en la raíz
- **Contenido**: Todas las variables de `Bindings` type en `apps/api/src/common/types/env.ts` con valores placeholder
- **Criterio**: Un nuevo developer puede copiar el archivo y saber exactamente qué llenar

### ~~T-014: Pre-commit hooks con Husky~~ ❌ REMOVED `[DX]`

- **Status**: Eliminado por solicitud del usuario (solo desarrollo individual).

### ~~T-015: Bundle size check en CI~~ ✅ DONE `[DX]`

- **Crear**: Script que ejecuta `wrangler deploy --dry-run --outdir=dist` y verifica que el output < 400KB
- **Integrar**: Como step en CI pipeline
- **Criterio**: CI falla si el API worker excede 400KB comprimido

### ~~T-016: Database migrations en CI~~ ✅ DONE `[DX]`

- **Agregar step** en deploy pipeline: `cd packages/db && pnpm push`
- **Prerequisito**: `DATABASE_URL` como secreto de GitHub
- **Criterio**: Schema changes se aplican automáticamente al mergear a main

---

## 3. 🎨 Frontend Polish (Actual: 95% → Meta: 100%)

### ~~T-017: Sidebar responsive (mobile hamburger menu)~~ ✅ DONE `[FE]`

- **Scope**: `apps/web/src/layouts/AppLayout.astro`
- **Problema**: El sidebar tiene `hidden md:block` — en mobile no hay navegación
- **Solución**: Hamburger button + drawer/overlay con slide-in animation + backdrop blur
- **Criterio**: Sidebar funcional en viewport < 768px con animación de slide-in

### ~~T-018: Sidebar link para Billing~~ ✅ DONE `[FE]`

- **Scope**: `apps/web/src/layouts/AppLayout.astro`
- **Problema**: La sidebar tiene links para Dashboard, Workspaces, Team, Settings — pero no para Billing
- **Solución**: Agregado `<a href="/billing">` con icono `CreditCard` + i18n key `nav.billing`
- **Criterio**: Link visible en sidebar (desktop + mobile), active state correcto

### ~~T-019: Página 404 personalizada~~ ✅ DONE `[FE]`

- **Crear**: `apps/web/src/pages/404.astro`
- **Diseño**: Gradient 404 glyph, mensaje "Page not found", botones "Go to Dashboard" + "Back to Home"
- **Criterio**: Astro sirve esta página automáticamente para rutas no existentes

### ~~T-020: Landing page completa~~ ✅ DONE `[FE]`

- **Scope**: `apps/web/src/pages/index.astro`
- **Solución**: Reemplazado placeholder con una landing premium de alta conversión:
  - Navbar sticky con glassmorphism y mobile menu
  - Hero section con gradientes, animaciones de entrada y CTAs claros
  - Features Grid bento-style (6 features clave)
  - Pricing Preview (Hobby, Startup, Enterprise)
  - Tech stack marquee y Footer completo
- **Criterio**: Página visualmente impactante que comunica el valor del producto con estética 10/10

### ~~T-021: Página `/workspaces`~~ ✅ DONE `[FE]`

- **Scope**: Sidebar link existe (`/workspaces`) pero la página probablemente no existe
- **Crear**: Vista para listar workspaces del usuario, crear nuevo workspace, switch entre workspaces
- **Criterio**: CRUD funcional conectado a `POST /api/workspaces` y `GET /api/workspaces`

### ~~T-022: i18n keys faltantes para billing y metrics~~ ✅ DONE `[FE]`

- **Scope**: `apps/web/src/i18n/ui.ts`
- **Agregadas keys**:
  - `billing.manage`, `billing.no_plan`, `billing.upgrade`
  - `metrics.team_members`, `metrics.total_tasks`, `metrics.api_usage`
  - `nav.billing` (EN + ES)
- **Criterio**: Todas las cadenas visibles en billing y dashboard están internacionalizadas

### ~~T-023: Empty states con ilustraciones~~ ✅ DONE `[FE]`

- **Scope**: `DashboardView.tsx`, `TeamManager.tsx`, `BillingDashboard.tsx`
- **Problema**: Los empty states son texto plano
- **Solución**: Usar el componente `EmptyState` existente con iconos/ilustraciones y CTAs claros
- **Criterio**: Cada vista vacía tiene ilustración + acción primaria

### ~~T-024: Toast para acciones exitosas~~ ✅ DONE `[FE]`

- **Scope**: `ProfileForm.tsx`, `InviteModal.tsx`, `TwoFactorSetup.tsx`, `WorkspacesView.tsx`
- **Problema**: Verificar que todas las acciones (save profile, send invite, enable 2FA) muestren toast de éxito
- **Criterio**: Toda acción mutante tiene feedback visual via sonner toast

### ~~T-025: Accessibility audit completo~~ ✅ DONE `[FE]`

- **Scope**: Todos los componentes interactivos
- **Checklist**:
  - [x] Todos los `<button>` con icon-only tienen `aria-label`
  - [x] Todos los `<input>` tienen `<label>` asociado o `aria-label`
  - [x] Focus rings visibles en todos los elementos interactivos
  - [x] Tab order lógico en formularios
  - [x] Color contrast ratio ≥ 4.5:1 (WCAG AA)
  - [x] Skip-to-content link en layouts
- **Criterio**: 0 errores en Lighthouse accessibility

---

## 4. 🔧 Backend Robustness (Actual: 98% → Meta: 100%)

### ~~T-026: Webhook idempotency~~ ✅ DONE `[BE]`

- **Scope**: `packages/services/src/modules/billing/billing.service.ts`
- **Problema**: Si un proveedor reintenta un webhook, `syncSubscription()` procesa duplicados
- **Solución**: Antes de procesar, verificar si `providerSubscriptionId` + `status` ya coinciden en DB. Si sí, retornar `{ success: true, skipped: true }`
- **Criterio**: El mismo webhook procesado 3 veces produce exactamente 1 write en DB

### ~~T-027: JWT refresh token flow~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/modules/auth/`, `packages/services/src/modules/auth/`, `packages/db/src/repositories/session.repository.ts`
- **Cambios**:
  - Implementado sistema de sesiones persistentes en DB (tabla `sessions`).
  - Generación de Access Token (1h) y Refresh Token (30d).
  - Endpoint `POST /api/auth/refresh` con rotación automática de tokens.
  - Actualizados `AuthService` y `AuthController` para soportar el flujo.
- **Criterio**: Session persiste sin re-login por duración del refresh token (ej: 30 días) y es revocable desde el backend.

### ~~T-028: Rate limit tuning por endpoint~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/modules/*/routes.ts`
- **Agregados límites específicos**:
  - `POST /api/auth/login`: 5/min
  - `POST /api/auth/register`: 3/min
  - `POST /api/storage/upload`: 20/min
  - `GET /api/metrics/dashboard`: 30/min
  - `POST /api/workspaces/`: 5/min
  - `POST /api/workspaces/invitations`: 10/min
- **Criterio**: Cada endpoint sensible tiene rate limit documentado y aplicado via middleware con keyPrefix único

### ~~T-029: Audit log para acciones críticas~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/common/services/audit.service.ts`, `apps/api/src/modules/auth/auth.controller.ts`, `apps/api/src/modules/billing/billing.controller.ts`
- **Cambios**:
  - Refactorizado `AuditService` para soportar logs globales (sin `workspaceId`).
  - Actualizado schema `audit_logs` para permitir `workspace_id` nulo.
  - Integrado en flows de Registro, Login y Checkout.
- **Criterio**: Toda acción destructiva o sensible tiene entry en `audit_logs` perfectamente trazable.

### ~~T-030: Error sanitization audit~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/common/middlewares/errorHandler.ts`
- **Mejoras**:
  - Implementado switch `isDev` para mostrar stacks de error solo en desarrollo
  - Errores de Drizzle/Neon/Network capturados y transformados a `INTERNAL_SERVER_ERROR` genérico en producción
  - Zod validation errors devuelven `issues` estructurados para debugging en el cliente (400)
- **Criterio**: `curl` en producción nunca expone traces de DB o paths internos

---

## 5. 📦 Shared Packages (Actual: 100% → Meta: 100%+)

### ~~T-031: Expandir packages/ui con componentes faltantes~~ ✅ DONE `[PKG]`

- **Scope**: `packages/ui/src/components/`
- **Agregados**: `badge.tsx`, `skeleton.tsx`, `label.tsx`, `separator.tsx`, `dropdown-menu.tsx`, `select.tsx`.
- **Status**: Instaladas dependencias de Radix UI y exportados todos los componentes en el index.
- **Criterio**: El boilerplate cuenta con un conjunto base de componentes premium listos para usar.

### ~~T-032: Email template para billing events~~ ✅ DONE `[PKG]`

- **Scope**: `packages/emails/src/templates/`
- **Agregados templates**:
  - `SubscriptionSuccessEmail.tsx` — Bienvenida al plan Pro/Enterprise
  - `SubscriptionCancelledEmail.tsx` — Notificación de cancelación y win-back
- **Status**: Exportados y registrados en el motor de renderizado del Jobs Worker
- **Criterio**: El Jobs Worker puede renderizar estos templates dinámicamente

### ~~T-033: Validator schemas para metrics y portal~~ ✅ DONE `[PKG]`

- **Scope**: `packages/validators/`
- **Agregados schemas**:
  - `dashboardMetricsResponseSchema` — Validación para respuesta de metrics
  - `portalResponseSchema` — Validación para URL del portal de billing
  - `subscriptionStatusResponseSchema` — Validación para el estado de la suscripción
- **Criterio**: Todos los nuevos endpoints tienen response schemas estructurados y exportados

---

## 6. 📖 Documentation & DX (Meta: completar docs/)

### ~~T-034: CONTRIBUTING.md~~ ❌ REMOVED `[DX]`

- **Status**: Eliminado por solicitud del usuario (no se espera colaboración externa).

### ~~T-035: CHANGELOG.md~~ ✅ DONE `[DX]`

- **Crear**: `CHANGELOG.md` en la raíz
- **Formato**: [Keep a Changelog](https://keepachangelog.com/)
- **Contenido inicial**: Release v1.0.0 con todas las features actuales y correcciones de hardening
- **Criterio**: Documento versionado que refleja la historia del proyecto

### ~~T-036: Documentar API endpoints en OpenAPI~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/modules/metrics/`, `billing/subscription`, `billing/portal`
- **Cambios**:
  - Migrados todos los endpoints "bare" a `createRoute()` pattern
  - Integrados los nuevos validators en el `responses` block de OpenAPI
- **Criterio**: Todos los endpoints premium aparecen correctamente tipados en `/docs`

---

## 7. 🛡️ Security Hardening

### ~~T-037: CSRF token validation~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/common/middlewares/csrfTokenGuard.ts`, `apps/api/src/modules/auth/auth.routes.ts`
- **Cambios**:
  - Implementado `csrfTokenGuard` usando el patrón _Double Submit Cookie_.
  - El middleware genera automáticamente un token en GET y valida su coincidencia en el header `X-CSRF-Token` para mutaciones.
  - Aplicado a todas las rutas de `auth` (login, register, etc.).
- **Criterio**: Requests POST a auth endpoints sin el header `X-CSRF-Token` válido son rechazados con 403.

### ~~T-038: Content Security Policy headers~~ ✅ DONE `[BE]`

- **Scope**: `apps/api/src/common/middlewares/secureHeaders.ts`
- **Configuraciones**:
  - `Content-Security-Policy` estricto (permitiendo scripts inline para Scalar docs)
  - `Permissions-Policy` restrictivo (desactivado camera, mic, geo, usb)
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Criterio**: Security headers score A+ en verificadores externos

### ~~T-039: Sensitive data encryption at rest~~ ✅ DONE `[BE]`

- **Scope**: `packages/services/src/common/encryption.ts`, `packages/services/src/modules/billing/billing.service.ts`, `apps/api/src/common/types/env.ts`
- **Cambios**:
  - Implementado módulo de `encryption` usando WebCrypto API (AES-GCM).
  - Configurada variable `ENCRYPTION_KEY` en el entorno.
  - El `BillingService` cifra de forma transparente el `providerCustomerId` antes de persistir y lo descifra al leer para generar el portal.
- **Criterio**: Datos sensibles de billing no son legibles directamente en DB y se manejan de forma segura en memoria solo cuando es necesario.

---

## 📊 Resumen por Prioridad

| Prioridad         |     Tasks     | Esfuerzo Est. | Impacto                                |
| ----------------- | :-----------: | :-----------: | -------------------------------------- |
| **P0 — Testing**  | T-001 a T-010 |     ~16h      | Crítico para credibilidad del template |
| **P1 — CI/CD**    | T-011 a T-016 |      ~8h      | Crítico para workflow profesional      |
| **P2 — Frontend** | T-017 a T-025 |     ~12h      | Alto impacto visual y UX               |
| **P3 — Backend**  | T-026 a T-030 |      ~8h      | Production hardening                   |
| **P4 — Packages** | T-031 a T-033 |      ~4h      | Template completeness                  |
| **P5 — Docs/DX**  | T-034 a T-036 |      ~3h      | Onboarding experience                  |
| **P6 — Security** | T-037 a T-039 |      ~5h      | Enterprise readiness                   |
| **Total**         | **39 tasks**  |   **~56h**    | **10/10**                              |

---

## 🎯 Orden de Ejecución Recomendado

```text
Sprint 1 (Foundations):    T-013, T-011, T-012, T-014     ← DX + CI/CD
Sprint 2 (Testing):        T-001 → T-010                   ← Test coverage
Sprint 3 (Frontend):       T-017, T-018, T-019, T-022      ← Quick wins
Sprint 4 (Hardening):      T-026, T-028, T-030, T-038      ← Security + robustness
Sprint 5 (Polish):         T-020, T-021, T-023, T-025      ← Visual excellence
Sprint 6 (Completion):     T-031 → T-036                   ← Packages + docs
Sprint 7 (Enterprise):     T-027, T-037, T-039             ← Advanced features
```
