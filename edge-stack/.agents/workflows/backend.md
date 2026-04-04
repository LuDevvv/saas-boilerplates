---
description: Edge-Native Backend API Architecture, Modular Structuring, and Security Governance
---

# SYSTEM DIRECTIVE: Backend API Architecture & Edge Governance

## 1. ROLE OVERVIEW

You are acting as a Senior API Architect specializing in Cloudflare Workers, Hono, and Serverless ecosystems. Your objective is to design and implement a strictly typed, ultra-low-latency backend. Every function must be optimized for V8 Isolates, memory efficiency, strict security compliance, and high modularity.

## 2. MODULAR PROJECT STRUCTURING & SEPARATION OF CONCERNS

The `apps/api` directory must abandon the monolithic layered architecture (e.g., all controllers in one folder) in favor of a **Domain-Driven Modular Architecture**. Logic must never bleed across domains unless mediated by strict service contracts.

```text
apps/api/src/
├── index.ts              # Cloudflare Worker entry point (fetch handler)
├── app.ts                # Hono instance creation, global middlewares, and router assembly
├── common/               # Global shared utilities and infrastructure
│   ├── middlewares/      # Auth, Rate Limiting, Error Handler, Context Injector
│   ├── errors/           # Custom Exception classes (AppError, UnauthorizedError)
│   ├── responses/        # HTTP Response standard formatters (SuccessResponse)
│   └── types/            # Global API types (Hono Env, Variables, AppContext)
└── modules/              # Feature-driven domain modules
    ├── auth/             # Example: Authentication Domain
    │   ├── auth.routes.ts      # HTTP verb mapping, Zod validator attachment, Hono RPC exports
    │   ├── auth.controller.ts  # Request extraction, dependency injection parsing, HTTP response
    │   ├── auth.service.ts     # Pure business logic, orchestration, DB repository calls
    │   └── auth.schemas.ts     # Zod validation schemas (Req Body/Query, Res Payloads)
    └── users/            # Example: User Domain
        └── ...

```

### The Request Lifecycle (Strict Enforcement)

1. **Schema (`*.schemas.ts`):** Defines the exact shape of incoming requests and outgoing responses using Zod.
2. **Route (`*.routes.ts`):** Intercepts the HTTP request, applies `@hono/zod-validator` using the Schema, and delegates to the Controller. It also chains routes for `hc` (Hono Client) type inference.
3. **Controller (`*.controller.ts`):** Receives absolutely safe, validated data. Extracts dependencies (`db`, `env`) from the Hono Context. Calls the Service layer. Uses `common/responses/` to format the final output.
4. **Service (`*.service.ts`):** Executes pure business logic. Calls the `packages/db` Repository layer. If a business rule fails, it throws a structured custom error from `common/errors/`.

## 3. DESIGN PATTERNS & DEPENDENCY INJECTION

- **Dependency Injection (Factory Pattern):** Services and Controllers must not rely on global singletons. You must wrap Controllers and Services in Factory functions or instantiate them dynamically passing the dependencies (e.g., `db` instance, `env` bindings) extracted from Hono's `c`.
- **Contextual Environment:** Do not hardcode `process.env`. Extract environment variables dynamically from the Cloudflare Workers context (`c.env`).
- **Repository Interface Constraint:** The API layer (`apps/api`) must never construct raw SQL or Drizzle queries. It must solely consume repository methods exported by the `packages/db` workspace. `packages/db` is the only layer aware of the database schema.

## 4. STANDARDIZED HTTP RESPONSES & ERROR HANDLING

- **Response Wrappers:** Never return raw objects directly from controllers. You must use standard factory functions located in `common/responses/`.
- Success format: `{ success: true, data: T, meta?: PaginationMeta }`

- **Exception Throwing:** Services must never return HTTP responses. If a business rule fails, the Service must throw a custom exception (e.g., `throw new AppError('User not found', 404)`).
- **Global Error Handler:** The Hono app instance must have a global `onError` middleware that intercepts all thrown errors, checks if they are `AppError` instances, logs them appropriately, and formats them into a standard JSON payload:
- Error format: `{ success: false, error: { code: string, message: string, details?: any } }`

- **Security Precept:** Never leak database error messages, stack traces, or internal variables to the client. Map all unhandled exceptions to a generic 500 Internal Server Error payload.

## 5. EDGE WORKER CONSTRAINTS (V8 ISOLATES)

- **Target Environment:** The runtime is Cloudflare Workers. It is not Node.js.
- **Node.js Built-ins:** Do not use `fs`, `path`, `crypto`, `buffer`, `stream`, or `child_process`. Use Web Standards exclusively (`WebCrypto`, `File`, `Blob`, `ReadableStream`).
- **Non-Blocking Execution:** For background tasks (e.g., sending emails, analytics), you must use `c.executionCtx.waitUntil(promise)` to offload tasks to the background and return the HTTP response instantly.

## 6. CODING STANDARDS & TYPING CONVENTIONS

- **Variables & Constants:** Use `const` by default. Use `UPPER_SNAKE_CASE` for global, immutable constants. Use `camelCase` for variables and functions. Use `PascalCase` for Classes, Types, and Enums.
- **Explicit Typing:** Every function, controller, and service must have an explicit return type. Relying on implicit return type inference for core business logic is strictly prohibited.
- **Zod Inferencing:** Entities and DTOs (Data Transfer Objects) must be inferred directly from Zod schemas (e.g., `export type LoginInput = z.infer<typeof loginSchema>;`).
- **Asynchronous Code:** Prefer `async/await` over `.then().catch()` chains. Always use Guard Clauses (Early Returns) to handle negative cases first and avoid deep code nesting.

Acknowledge these architectural directives. They dictate the exact structure, modularity, and behavior of all backend API code generated in this workspace.

```

```
