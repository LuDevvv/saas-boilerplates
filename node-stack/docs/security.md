# Security Architecture Documentation

The Node Stack implements a defense-in-depth security model, ensuring that every request is authenticated, authorized, and validated.

---

## 1. Authentication

### 1.1 Dual-Auth Strategy
The system supports two primary authentication methods via Passport.js strategies:
1.  **JWT Bearer**: Used by the Web/Dashboard applications. Includes Refresh Token rotation and HTTPOnly cookies.
2.  **API Keys**: Used for programmatic access. Keys are hashed using SHA-256 and support scoped permissions (e.g., `ai:jobs`).

### 1.2 Multi-Factor Authentication (2FA)
Native support for **TOTP** (Google Authenticator, Authy).
- Secure 2FA enrollment with QR codes.
- Encrypted recovery codes generated upon activation.

---

## 2. Authorization (RBAC)

We use a granular **Role-Based Access Control** system mapped to specific permissions.

### 2.1 Role Hierarchy
- **`super_admin`**: Global system access.
- **`owner`**: Full control over a specific workspace.
- **`admin`**: Full workspace management except critical billing/deletion.
- **`member`**: Standard read/write access to workspace resources.
- **`guest`**: Read-only access.

### 2.2 Declarative Protection
Guards are applied at the controller or method level using decorators:
```typescript
@RequirePermissions(Permission.WORKSPACE_WRITE)
@Roles(Role.ADMIN)
@ApiBearerAuth()
```

---

## 3. Data Integrity & Validation

### 3.1 Zod-Driven Validation
We use **Zod** as the single source of truth for all data shapes.
- **DTOs**: Validated at the edge using `nestjs-zod`.
- **Database**: Drizzle schema is aligned with Zod types.
- **OpenAPI**: Swagger documentation is automatically generated from Zod schemas, including examples and descriptions.

### 3.2 Idempotency
To prevent duplicate operations during network retries, critical endpoints use the `@Idempotent()` decorator. This uses Redis to "lock" a request ID for 24 hours.

---

## 4. Infrastructure Security

- **Encryption at Rest**: Sensitive data (like API Key previews or provider IDs) is encrypted using AES-256-GCM.
- **Row-Level Security (RLS)**: Enforced at the PostgreSQL level to ensure tenant isolation.
- **Security Headers**: Managed via `helmet`, including strict CSP and HSTS policies.
- **Rate Limiting**: Distributed rate limiting using Redis, with different tiers for Free vs. Pro plans.

---

## 5. Audit Logging

Every high-privilege action (role changes, billing updates, deletions) is recorded in the `audit_logs` table.
- **Who**: `userId` and `ipAddress`.
- **What**: `action` and `entityId`.
- **Metadata**: JSON snapshot of the change.
