# Dashboard Gap Analysis Report

## 1. Executive Summary

**Current Completion: ~40%**

Your dashboard has solid UI scaffolding across auth, billing, admin, tickets, notifications, and AI playground, but a large portion of your backend API remains unexposed in the UI.

### Main Missing Areas

| Domain | Gap Level |
|--------|----------|
| **Workspaces** (member mgmt, invitations, webhooks, API keys) | **Critical** — Only 1 of ~15 endpoints consumed |
| **Analytics** (real API integration) | **High** — Fully mock-driven, 5 real endpoints untouched |
| **AI Jobs** (background job management) | **High** — Playground exists, jobs table missing |
| **Storage** (file browser UI) | **Medium** — Upload flow exists, no file browser |
| **Billing** (endpoint inconsistencies) | **Low** — Path mismatch between frontend & API |

---

## 2. Feature Gap Analysis

### 2.1 Workspaces (CRITICAL GAP)

**Backend:** 10+ endpoints across workspaces, members, invitations, API keys, webhooks, portability  
**Frontend:** Only `workspace.list`, `workspace.update` consumed — minimal UI, no dedicated pages

| What's Implemented | What's Missing |
|------------------|------------|
| Workspace switcher (sidebar) | Full Workspace Settings page |
| | Create Workspace wizard |
| | Members list & role management |
| | Invitation flow (send, view pending, accept/decline) |
| | API Keys management page |
| | Webhooks management (create, test, rotate, delivery history) |
| | Data portability request page |

**Priority:** HIGH

---

### 2.2 AI

**Backend:** Chat sync, streaming, job queue, usage tracking  
**Frontend:** Playground with mock data, streaming wired

| What's Implemented | What's Missing |
|------------------|------------|
| AI Playground (chat UI, streaming) | AI Jobs history table |
| | Usage / quota panel |
| | Jobs cancel/delete actions |

**Priority:** MEDIUM

---

### 2.3 Analytics

**Backend:** 5 distinct analytics endpoints:
- `GET /analytics/workspaces/:workspaceId/usage`
- `GET /analytics/workspaces/:workspaceId/overview`
- `GET /analytics/workspaces/:workspaceId/traffic`
- `GET /analytics/workspaces/:workspaceId/pages`
- `GET /analytics/admin/global-stats`

**Frontend:** Completely mock-driven KPI grid & charts

| What's Implemented | What's Missing |
|------------------|------------|
| KPI cards (mock data) | `getOverview()` wiring |
| Charts (mock data) | `getUsage()` wiring |
| Top products table | `getTraffic()` wiring |
| | `getPages()` per-page analytics |
| | `/admin/global-stats` for admin |

**Priority:** HIGH

---

### 2.4 Storage

**Backend:**
- `POST /storage/upload-url` - Get presigned URL
- `POST /storage/confirm-upload` - Confirm upload
- `GET /storage/:fileId` - Get file
- `DELETE /storage/:fileId` - Delete file
- `GET /storage/files` - List files

**Frontend:** Partial upload implementation

| What's Implemented | What's Missing |
|------------------|------------|
| `getUploadUrl` / `confirmUpload` | File browser with folder nav |
| `useFileUpload` hook | List files grid/table view |
| | File preview modal |
| | File delete action |

**Priority:** MEDIUM

---

### 2.5 Billing

**Backend:** `/workspaces/:id/billing/*` paths  
**Frontend:** Uses `/billing/*` (no workspace ID in path) — **inconsistent routing**

| What's Implemented | What's Missing |
|------------------|------------|
| Subscription card | Endpoint path alignment with API |
| Plan selection | Plans catalog page |
| Payment methods | |
| Invoice history | |
| Cancel subscription | |

**Priority:** LOW

---

### 2.6 Admin

**Backend:**
- `GET /admin/stats/overview` - System stats
- `GET /admin/users` - List users
- `PATCH /admin/users/:id/role` - Update user role
- `POST /admin/users/:id/impersonate` - Impersonate user
- `GET /admin/feature-flags` - List feature flags
- `POST /admin/feature-flags/:flagKey/enable|disable` - Toggle flags

**Frontend:** Overview page, Manage Users, Audit Logs — decent coverage

| What's Implemented | What's Missing |
|------------------|------------|
| Admin overview (mock stats) | Global analytics (`/admin/global-stats`) |
| User table (mock data) | User impersonation flow |
| Audit logs list | Feature flags UI |
| | Dynamic config management |

**Priority:** MEDIUM

---

### 2.7 Notifications

**Backend:**
- `GET /notifications` - List notifications
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/test` - Send test (admin only)

**Frontend:** List page, mark single as read

| What's Implemented | What's Missing |
|------------------|------------|
| Notifications list page | Mark all as read (`/notifications/read-all`) |
| Mark single as read | Dismiss notification |
| Bell indicator | |

**Priority:** LOW

---

### 2.8 Tickets

**Backend:** Full CRUD, soft delete

**Frontend:** Full CRUD UI - No gaps

**Priority:** NONE

---

## 3. Missing Components & Pages — Detailed List

### 3.1 Workspaces & Members

#### `/workspace/settings` — Workspace Settings Page

| Item | Details |
|------|---------|
| **Components** | `WorkspaceSettingsContent`, `WorkspaceBasicInfo`, `WorkspaceDangerZone` |
| **Location** | `features/workspaces/pages/`, `features/workspaces/components/Settings/` |
| **Purpose** | Edit name, slug, domain, branding. Delete workspace. |
| **UI** | Form + Card layout |
| **Hooks** | `useUpdateWorkspace`, `useDeleteWorkspace` |
| **Reference** | Linear, Vercel dashboard workspace settings |

---

#### `/workspace/members` — Team Members Page

| Item | Details |
|------|---------|
| **Components** | `MembersTable`, `MemberRow`, `InviteMemberModal`, `RoleSelect` |
| **Location** | `features/workspaces/pages/`, `features/workspaces/components/Members/` |
| **Purpose** | List members, invite by email, change roles, remove members |
| **UI** | DataTable with role dropdowns + invite modal |
| **Hooks** | `useWorkspaceMembers`, `useInviteMember`, `useRemoveMember`, `useUpdateMemberRole` |

---

#### `/invitations` — Pending Invitations Page

| Item | Details |
|------|---------|
| **Components** | `InvitationsList`, `InvitationCard`, `AcceptDeclineButtons` |
| **Location** | `features/workspaces/pages/InvitationsPage.tsx` |
| **Purpose** | View & accept/decline workspace invitations |
| **UI** | Card list with Accept/Decline actions |
| **Hooks** | `usePendingInvitations`, `useAcceptInvitation`, `useDeclineInvitation` |

---

#### Invitation Email Link — Accept Flow

| Item | Details |
|------|---------|
| **Page** | `pages/_workspace/InvitationAcceptPage.tsx` |
| **Route** | `/invitations/:token` |
| **Components** | `InvitationBanner`, `WorkspacePreview` |
| **Purpose** | Public page for accepting invitation via email token |
| **Reference** | GitHub organization invite accept |

---

### 3.2 Webhooks Management

#### `/workspace/webhooks` — Webhooks Page

| Item | Details |
|------|---------|
| **Components** | `WebhooksList`, `WebhookCard`, `CreateWebhookModal`, `WebhookDetailDrawer` |
| **Location** | `features/workspaces/pages/WebhooksPage.tsx`, `features/workspaces/components/Webhooks/` |
| **Purpose** | Create, list, test, rotate secrets, view delivery history |
| **UI** | Card list + Drawer for detail + delivery log |
| **Hooks** | `useWebhooks`, `useCreateWebhook`, `useTestWebhook`, `useRotateWebhookSecret`, `useWebhookDeliveries` |

---

### 3.3 API Keys

#### `/workspace/api-keys` — API Keys Page

| Item | Details |
|------|---------|
| **Components** | `ApiKeysTable`, `ApiKeyRow`, `CreateApiKeyModal`, `ApiKeyCopyModal` |
| **Location** | `features/workspaces/pages/ApiKeysPage.tsx`, `features/workspaces/components/ApiKeys/` |
| **Purpose** | Create API keys, copy secret (shown once), revoke keys |
| **UI** | Table with copy-to-clipboard + revoke action |
| **Hooks** | `useApiKeys`, `useCreateApiKey`, `useRevokeApiKey` |

---

### 3.4 Storage File Browser

#### `/storage` — File Browser Page

| Item | Details |
|------|---------|
| **Components** | `FileGrid`, `FileRow`, `FolderBreadcrumb`, `UploadDropzone`, `FilePreviewModal` |
| **Location** | `features/storage/pages/FileBrowserPage.tsx`, `features/storage/components/FileBrowser/` |
| **Purpose** | Browse, upload, preview, delete files in workspace storage |
| **UI** | Grid/table toggle + breadcrumb navigation + drag-drop upload |
| **Hooks** | `useStorageFiles`, `useDeleteStorageFile`, `useFileUpload` |

---

### 3.5 AI Jobs

#### `/ai/jobs` — AI Jobs Page

| Item | Details |
|------|---------|
| **Components** | `JobsTable`, `JobRow`, `JobStatusBadge`, `JobDetailDrawer` |
| **Location** | `features/ai/pages/AIJobsPage.tsx`, `features/ai/components/Jobs/` |
| **Purpose** | View background job history, status, cancel, delete jobs |
| **UI** | Table with status badges + detail drawer |
| **Hooks** | `useAiJobs`, `useCancelAiJob`, `useDeleteAiJob` |

---

### 3.6 Analytics (Real API Integration)

#### AnalyticsContent Rewrite

| Item | Details |
|------|---------|
| **Components** | `UsageQuotas`, `UsageBar`, `TrafficChart`, `PagesTable` |
| **Location** | `features/analytics/components/` |
| **Purpose** | Wire up `getOverview`, `getUsage`, `getTraffic`, `getPages` |
| **UI** | KPI cards + Charts + DataTable |
| **Hooks** | `useAnalyticsOverview`, `useAnalyticsUsage`, `useAnalyticsTraffic` |

---

### 3.7 Admin (Remaining)

#### `/admin/analytics` — Global Analytics Page

| Item | Details |
|------|---------|
| **Components** | `GlobalStatsGrid`, `PlatformRevenueChart`, `ActiveWorkspacesTable` |
| **Location** | `pages/_admin/GlobalAnalyticsPage.tsx` |
| **Purpose** | System-wide analytics for super-admins |
| **UI** | Grid of stats + revenue chart |
| **Hooks** | `useGlobalAdminStats` |

---

#### Impersonation Modal

| Item | Details |
|------|---------|
| **Components** | `ImpersonateUserModal` |
| **Location** | `features/admin/components/ManageUsers/` |
| **Purpose** | Admin impersonates a user for support/debugging |
| **UI** | Modal with user search + confirm impersonation |
| **Reference** | Shopify admin impersonation |

---

#### Feature Flags Page

| Item | Details |
|------|---------|
| **Components** | `FeatureFlagsTable`, `FlagToggle` |
| **Location** | `pages/_admin/FeatureFlagsPage.tsx` |
| **Purpose** | Toggle feature flags per workspace/user |
| **UI** | Table with toggle switches |
| **Hooks** | `useFeatureFlags`, `useToggleFeatureFlag` |

---

### 3.8 Data Portability

#### `/workspace/portability` — Data Export Page

| Item | Details |
|------|---------|
| **Components** | `ExportRequestsList`, `ExportCard`, `RequestExportModal` |
| **Location** | `features/workspaces/pages/PortabilityPage.tsx` |
| **Purpose** | Request GDPR/HIPAA data export, download packages |
| **UI** | List of requests + status badges + download button |
| **Hooks** | `useExportRequests`, `useRequestExport`, `useExportDownload` |

---

### 3.9 Notifications (Missing Actions)

| Item | Details |
|------|---------|
| **Component** | `MarkAllReadButton` (in toolbar) |
| **Location** | `features/notifications/components/` |
| **Purpose** | Mark all notifications as read in one click |
| **Hook** | `useMarkAllNotificationsRead` |

---

## 4. Missing Flows & Interactions

| Flow | Description | Missing Pieces |
|------|------------|---------------|
| **Onboarding → First Workspace** | After signup, prompt to create first workspace | Create Workspace wizard/modal, post-creation redirect |
| **Invitation Accept Flow** | User clicks email link → accept invitation → join workspace | `/invitations/:token` page, `useAcceptInvitation` hook, workspace switcher update |
| **Webhook Test Flow** | Create webhook → send test event → check delivery log | Test button + delivery history drawer |
| **API Key Creation** | Name key → click create → show secret once → copy | Modal with secret display (one-time), copy button |
| **Data Export Flow** | Request export → background job → email notification → download | Request modal, status polling, download URL handling |
| **User Impersonation** | Admin selects user → impersonate → banner shown → audit log | Impersonation modal, impersonation banner UI, audit trail |
| **2FA Setup** | User goes to Security → scans QR → enters code | 2FA setup flow, TOTP QR modal |
| **Storage Upload Dropzone** | Drag file anywhere → upload → progress bar | Global dropzone overlay |
| **Command Palette** | Cmd+K → search users, pages, actions | More comprehensive command palette integration |

---

## 5. Data Visualization & Dashboard Opportunities

### Main Dashboard Landing Page (`/`)

| Section | Source | Visualization |
|---------|--------|------------|
| Quick Stats Row | `getUsage()` | 4x KPI stat cards (API calls, storage used, users, revenue) |
| Activity Sparkline | `getUsage()` | Small sparkline per workspace |
| Recent Activity | `getOverview()` | Timeline / activity feed |
| Quick Actions | — | Card grid (New Ticket, Upload, Invite Member, AI Chat) |
| Usage Quota Bar | `getUsage()` | Progress bars per quota metric |
| AI Insight Card | `getOverview()` | Auto-generated recommendation card |

---

### Analytics Page (`/analytics`)

| Section | Source | Visualization |
|---------|--------|------------|
| Workspace Usage | `getUsage()` | Gauge + progress bars |
| Overview Metrics | `getOverview()` | Line chart + comparison vs previous period |
| Traffic Over Time | `getTraffic()` | Area chart with date range |
| Top Pages | `getPages()` | Horizontal bar chart |
| User Retention | `getOverview()` | Cohort table or funnel chart |
| AI Usage | `/ai/usage` | Token usage + cost breakdown |

---

### Admin Overview (`/admin`)

| Section | Source | Visualization |
|---------|--------|------------|
| Platform Stats | `getGlobalAdminStats()` | Large stat cards |
| Revenue Chart | `/admin/global-stats` | MRR/ARR line chart |
| Active Workspaces | `/admin/stats/overview` | Table with sparklines |
| System Health | `/admin/stats/overview` | Uptime gauge + memory bar |

---

## 6. Prioritized Implementation Roadmap

### Phase 1 — Core Infrastructure (Must Have)

1. **Workspace Settings page** + Members management + Invitations → closes the biggest API gap
2. **Analytics real API wiring** → replace all mock data in `/analytics`
3. **API Keys management page** → quick win, clear value
4. **Webhooks management** → essential for integrations ecosystem
5. **Billing endpoint alignment** → fix path inconsistencies (`/billing/*` → `/workspaces/:id/billing/*`)

### Phase 2 — Rich Features (Should Have)

6. **AI Jobs history page** → completes the AI feature set
7. **Storage File Browser** → completes file management
8. **Mark All Notifications Read** → single missing notification action
9. **Global Admin Analytics page** → completes admin feature
10. **User Impersonation flow** → support/debugging capability
11. **Data Export (Portability) page** → compliance feature

### Phase 3 — Polish (Nice to Have)

12. **Feature Flags admin UI** → operational feature
13. **2FA Setup flow** → security hardening
14. **Global dropzone** for file uploads
15. **Enhanced command palette**
16. **Workspace creation wizard** (multi-step onboarding)

---

## 7. Quick Start — Top 3 Actions

### 1. Biggest Gap (Workspaces)
Start with `WorkspacesPage` + `MembersTable` + `InviteMemberModal` — that's ~15 API endpoints covered at once.

### 2. Quick Win (API Keys)
Build `ApiKeysPage` with `useCreateApiKey` → show secret once → copy. Self-contained, ~150 lines.

### 3. Highest Impact (Analytics)
Wire `getOverview`, `getUsage`, `getTraffic`, `getPages` into `AnalyticsContent` — replace mock data in ~3 components.

---

## 8. API Endpoints Summary

### Already Consumed by Frontend

| Module | Endpoint | Status |
|--------|----------|--------|
| Auth | POST /auth/login | ✅ |
| Auth | POST /auth/register | ✅ |
| Auth | POST /auth/refresh | ✅ |
| Auth | POST /auth/logout | ✅ |
| Billing | POST /billing/checkout | ✅ (but path issue) |
| Billing | GET /billing/subscription | ✅ (but path issue) |
| Billing | GET /billing/invoices | ✅ (but path issue) |
| Billing | GET /billing/payment-methods | ✅ (but path issue) |
| Billing | POST /billing/subscription/cancel | ✅ (but path issue) |
| Tickets | GET /tickets | ✅ |
| Tickets | POST /tickets | ✅ |
| Tickets | GET /tickets/:id | ✅ |
| Tickets | PATCH /tickets/:id | ✅ |
| Admin | GET /admin/stats | ✅ (mock data) |
| Admin | GET /admin/users | ✅ (mock data) |
| Admin | GET /admin/audit-logs | ✅ |
| Notifications | GET /notifications | ✅ |
| Notifications | PATCH /notifications/:id/read | ✅ |
| AI | POST /ai/chat | ✅ |
| Storage | POST /storage/upload-url | ✅ |
| Storage | POST /storage/confirm-upload | ✅ |
| Workspaces | GET /workspaces | ✅ |
| Workspaces | PATCH /workspaces/:id | ✅ |

### NOT Yet Consumed (Missing in UI)

| Module | Endpoint | Priority |
|--------|----------|----------|
| Workspaces | POST /workspaces | HIGH |
| Workspaces | GET /workspaces/:id | HIGH |
| Workspaces | DELETE /workspaces/:id | HIGH |
| Workspaces | GET /workspaces/:id/members | HIGH |
| Workspaces | POST /workspaces/:id/members/invite | HIGH |
| Workspaces | DELETE /workspaces/:id/members/:memberId | HIGH |
| Workspaces | PATCH /workspaces/:id/members/:userId | HIGH |
| Invitations | GET /workspace-invitations/pending | HIGH |
| Invitations | GET /workspaces/:id/invitations | HIGH |
| Invitations | DELETE /workspaces/:id/invitations/:id | HIGH |
| Invitations | POST /workspace-invitations/:token/accept | HIGH |
| Webhooks | GET /workspaces/:id/webhooks | HIGH |
| Webhooks | POST /workspaces/:id/webhooks | HIGH |
| Webhooks | DELETE /workspaces/:id/webhooks/:id | HIGH |
| Webhooks | GET /workspaces/:id/webhooks/:id/deliveries | HIGH |
| Webhooks | POST /workspaces/:id/webhooks/:id/test | HIGH |
| Webhooks | POST /workspaces/:id/webhooks/:id/rotate-secret | HIGH |
| API Keys | GET /api-keys | HIGH |
| API Keys | POST /api-keys | HIGH |
| API Keys | DELETE /api-keys/:id | HIGH |
| Analytics | GET /analytics/workspaces/:id/usage | HIGH |
| Analytics | GET /analytics/workspaces/:id/overview | HIGH |
| Analytics | GET /analytics/workspaces/:id/traffic | HIGH |
| Analytics | GET /analytics/workspaces/:id/pages | HIGH |
| Analytics | GET /analytics/admin/global-stats | MEDIUM |
| AI | GET /ai/jobs | MEDIUM |
| AI | GET /ai/jobs/:jobId | MEDIUM |
| AI | POST /ai/jobs/:jobId/cancel | MEDIUM |
| AI | DELETE /ai/jobs/:jobId | MEDIUM |
| AI | GET /ai/usage | MEDIUM |
| Storage | GET /storage/files | MEDIUM |
| Storage | DELETE /storage/files/:fileId | MEDIUM |
| Portability | GET /workspaces/:id/portability | MEDIUM |
| Portability | POST /workspaces/:id/portability | MEDIUM |
| Portability | GET /workspaces/:id/portability/:requestId | MEDIUM |
| Portability | GET /workspaces/:id/portability/:requestId/download | MEDIUM |
| Admin | POST /admin/users/:id/impersonate | MEDIUM |
| Admin | GET /admin/feature-flags | LOW |
| Admin | POST /admin/feature-flags/:key/enable | LOW |
| Admin | POST /admin/feature-flags/:key/disable | LOW |
| Notifications | POST /notifications/read-all | LOW |
| Notifications | DELETE /notifications/:id | LOW |

---

*Report generated from codebase analysis*
*Files analyzed: apps/api/src/*, apps/dashboard/src/*, packages/api-client/src/*