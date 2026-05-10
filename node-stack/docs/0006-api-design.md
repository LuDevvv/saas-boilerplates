# ADR 0006 — API Design Conventions

**Status:** Accepted  
**Date:** 2026-05-09

## Context

We need consistent conventions for the REST API to ensure predictable behavior for clients and to make the codebase maintainable.

## Decision

### URL structure

```
/api/v1/{resource}             # Top-level resources
/api/v1/{resource}/{id}        # Single resource
/api/v1/workspaces/{wid}/{sub} # Workspace-scoped sub-resources
```

Exceptions (no `api/v1` prefix):
- `/api/docs` — Swagger UI
- `/api/reference` — Scalar UI
- `/billing/webhook` — Polar webhook (raw body requirement)
- `/health` — Health checks

### Response shape

All endpoints return the resource directly (not wrapped in `{ data: ... }`).
The axios client interceptor unwraps any `{ data }` wrapper from the server if present.

Paginated endpoints return:
```json
{ "data": [...], "nextCursor": "base64..." }
```

### Pagination

Use **cursor-based pagination** (not offset) for all list endpoints with unbounded size.
Cursor: compound `(createdAt DESC, id DESC)` encoded as base64 JSON.
This is stable across concurrent writes.

Query params: `cursor`, `limit` (default 20, max 100) via `PaginationDto`.

### Error responses

```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [{ "path": ["email"], "message": "Invalid email" }]
}
```

HTTP status codes:
- `400` Bad Request — malformed input
- `401` Unauthorized — missing/invalid token
- `403` Forbidden — valid token but insufficient permissions
- `404` Not Found — resource doesn't exist for this tenant
- `409` Conflict — duplicate resource
- `422` Unprocessable Entity — validation failure (Zod errors)
- `429` Too Many Requests — rate limit hit
- `500` Internal Server Error — unexpected error (never leak stack traces)

### Validation

All input DTOs use **Zod schemas** via `nestjs-zod` + `createZodValidationPipe`.
Zod schemas live in `@node-stack/validators`.

### Idempotency

Mutation endpoints that are expensive or non-idempotent should support the
`Idempotency-Key` header via `@Idempotent()` decorator. The key is stored in Redis
with the response for 24 hours.

### Rate limiting

Applied globally via `ThrottlerGuard`. Internal IPs (127.0.0.1, ::1) are exempt.
Custom limits per endpoint via `@Throttle()`.

### Multi-tenancy

Workspace-scoped endpoints require:
1. `JwtAuthGuard` — validates access token
2. `WorkspaceGuard` — validates membership + injects `req.workspace`

The `workspaceId` is extracted from `params.workspaceId`, headers
(`x-workspace-id`, `x-tenant-id`), or `params.id` for workspace-primary routes.

## Consequences

- Cursor pagination requires clients to store the cursor between pages.
- The 422/Zod error format is non-standard; clients must handle it explicitly.
- Workspace context must be established before any RLS query.
