# Security Architecture Documentation

## 1. Security Overview

The Node.js SaaS Backend implements defense-in-depth security with multiple layers of protection.

---

## 2. Authentication

### 2.1 JWT Implementation

```typescript
// packages/auth/src/jwt.service.ts
import { Injectable } from "@nestjs/common";
import { JwtService as NestJwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  workspaceId?: string; // Optional: current workspace context
  permissions?: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  sign(payload: Omit<JwtPayload, "iat" | "exp">): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }

  generateTokenPair(user: User): TokenPair {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.sign(payload);
    const expiresIn = this.configService.get<number>("JWT_EXPIRES_IN", 3600);

    return {
      accessToken,
      refreshToken: this.generateRefreshToken(),
      expiresIn,
    };
  }
}
```

### 2.2 Token Configuration

| Token Type        | Expiry     | Storage         | Purpose               |
| ----------------- | ---------- | --------------- | --------------------- |
| **Access Token**  | 15 minutes | Memory          | API authorization     |
| **Refresh Token** | 30 days    | HTTPOnly Cookie | Session refresh       |
| **2FA Pending**   | 15 minutes | Memory          | 2FA verification flow |

### 2.3 Password Security

```typescript
// packages/auth/src/password.service.ts
import * as crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return `${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return key === verifyHash;
}
```

---

## 3. Authorization (RBAC)

### 3.1 Role Hierarchy

```
super_admin
    │
    ├── admin (workspace)
    │   │
    │   ├── member
    │   │   │
    │   │   └── guest
```

### 3.2 Permission Matrix

| Action            | super_admin | admin | member | guest |
| ----------------- | ----------- | ----- | ------ | ----- |
| **Users**         |             |       |        |       |
| Create user       | ✓           | ✗     | ✗      | ✗     |
| Read user         | ✓           | ✓     | ✗      | ✗     |
| Update user       | ✓           | ✓     | ✗      | ✗     |
| Delete user       | ✓           | ✗     | ✗      | ✗     |
| **Workspaces**    |             |       |        |       |
| Create workspace  | ✓           | ✓     | ✓      | ✗     |
| Read workspace    | ✓           | ✓     | ✓      | ✓     |
| Update workspace  | ✓           | ✓     | ✗      | ✗     |
| Delete workspace  | ✓           | ✗     | ✗      | ✗     |
| **Billing**       |             |       |        |       |
| View subscription | ✓           | ✓     | ✓      | ✗     |
| Manage billing    | ✓           | ✓     | ✗      | ✗     |
| **Tasks**         |             |       |        |       |
| Create task       | ✓           | ✓     | ✓      | ✗     |
| Read task         | ✓           | ✓     | ✓      | ✗     |
| Update task       | ✓           | ✓     | ✓      | ✗     |
| Delete task       | ✓           | ✓     | ✗      | ✗     |

### 3.3 RBAC Implementation

```typescript
// packages/auth/src/rbac.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

```typescript
// packages/auth/src/rbac.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./rbac.decorator";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredPermissions.some((permission) =>
      user.permissions?.includes(permission),
    );
  }
}
```

---

## 4. Input Validation

### 4.1 Zod Validation Schemas

```typescript
// packages/validators/src/auth.ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(255).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().uuid(),
});
```

### 4.2 NestJS Validation Pipe

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove non-whitelisted properties
    forbidNonWhitelisted: true, // Throw on non-whitelisted
    transform: true, // Transform payloads to DTOs
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

---

## 5. Rate Limiting

### 5.1 Rate Limit Configuration

| Tier           | Requests | Window   | Scope     |
| -------------- | -------- | -------- | --------- |
| **Free**       | 100      | 1 minute | IP        |
| **Pro**        | 1000     | 1 minute | User      |
| **Enterprise** | 10000    | 1 minute | Workspace |

### 5.2 Implementation

```typescript
// packages/cache/src/rate-limiter.ts
import { Redis } from "ioredis";

export class RateLimiter {
  constructor(private redis: Redis) {}

  async check(
    key: string,
    limit: number,
    window: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const windowStart = now - window * 1000;
    const fullKey = `ratelimit:${key}`;

    // Remove old entries
    await this.redis.zremrangebyscore(fullKey, 0, windowStart);

    // Count current requests
    const count = await this.redis.zcard(fullKey);

    if (count >= limit) {
      const oldest = await this.redis.zrange(fullKey, 0, 0, "WITHSCORES");
      return {
        allowed: false,
        remaining: 0,
        reset: Math.ceil((parseInt(oldest[1]) + window * 1000 - now) / 1000),
      };
    }

    // Add new request
    await this.redis.zadd(fullKey, now.toString(), `${now}-${Math.random()}`);
    await this.redis.expire(fullKey, window);

    return {
      allowed: true,
      remaining: limit - count - 1,
      reset: window,
    };
  }
}
```

---

## 6. Encryption

### 6.1 Data Encryption at Rest

```typescript
// packages/crypto/src/encryption.service.ts
import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

export class EncryptionService {
  private key: Buffer;

  constructor(encryptionKey: string) {
    // Derive key from encryption key using PBKDF2
    const salt = crypto.createHash("sha256").update(encryptionKey).digest();
    this.key = crypto.pbkdf2Sync(
      encryptionKey,
      salt,
      100000,
      KEY_LENGTH,
      "sha512",
    );
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
```

---

## 7. Security Headers

### 7.1 Helmet Configuration

```typescript
// main.ts
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);
```

### 7.2 CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Request-ID", "X-RateLimit-*"],
  maxAge: 86400,
});
```

---

## 8. Audit Logging

### 8.1 Audit Event Types

| Category           | Events                                                                             |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Authentication** | login, logout, login_failed, password_reset, 2fa_enabled, 2fa_disabled             |
| **Workspace**      | workspace_created, workspace_updated, workspace_deleted                            |
| **Membership**     | member_added, member_removed, role_changed, invitation_sent, invitation_accepted   |
| **Billing**        | subscription_created, subscription_updated, subscription_cancelled, payment_failed |
| **Data**           | resource_created, resource_updated, resource_deleted                               |

### 8.2 Audit Log Structure

```typescript
// packages/db/src/schema/audit.ts
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id"),
  userId: uuid("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 9. Webhook Security

### 9.1 Webhook Signature Verification

```typescript
// packages/billing/src/webhook-verifier.ts
import * as crypto from "crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string,
): boolean {
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}
```

---

## 10. Security Checklist

### 10.1 Production Requirements

- [ ] HTTPS enforced (TLS 1.3)
- [ ] JWT secrets rotated regularly
- [ ] Database credentials secured
- [ ] Redis password enabled
- [ ] Rate limiting enabled
- [ ] Security headers applied
- [ ] Audit logging active
- [ ] 2FA available for users
- [ ] Input validation enforced
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (output encoding)
- [ ] CSRF protection enabled

### 10.2 Compliance

| Requirement | Implementation                   |
| ----------- | -------------------------------- |
| **GDPR**    | Data export, deletion, consent   |
| **PCI-DSS** | Payment tokenization, encryption |
| **SOC 2**   | Audit logs, access controls      |
