# API Reference

## 1. Authentication

### 1.1 Register

Register a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

### 1.2 Login

Authenticate a user.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

**Response - 2FA Required (200):**

```json
{
  "data": {
    "pending2fa": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Refresh Token

Refresh access token.

**Endpoint:** `POST /api/v1/auth/refresh`

**Cookies:**

- `refreshToken`: HTTPOnly cookie containing refresh token

**Response (200):**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new-refresh-token-uuid"
  }
}
```

### 1.4 Logout

Revoke current session.

**Endpoint:** `POST /api/v1/auth/logout`

**Response (204):** No content

### 1.5 Setup 2FA

Initialize 2FA setup for a user.

**Endpoint:** `POST /api/v1/auth/2fa/setup`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "uri": "otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
  }
}
```

### 1.6 Verify 2FA

Complete 2FA setup or verify during login.

**Endpoint:** `POST /api/v1/auth/2fa/verify`

**Request Body:**

```json
{
  "pendingToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "123456"
}
```

**Response (200):**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

### 1.7 Enable 2FA

Enable 2FA after verification.

**Endpoint:** `POST /api/v1/auth/2fa/enable`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "token": "123456"
}
```

**Response (200):**

```json
{
  "data": {
    "recoveryCodes": ["abc123-def456", "ghi789-jkl012", "..."]
  }
}
```

---

## 2. Users

### 2.1 Get Current User

Get the currently authenticated user.

**Endpoint:** `GET /api/v1/users/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "avatarUrl": "https://...",
    "emailVerified": true,
    "twoFactorEnabled": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2.2 Update Current User

Update the authenticated user's profile.

**Endpoint:** `PATCH /api/v1/users/me`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Jane Doe",
  "avatarUrl": "https://..."
}
```

**Response (200):**

```json
{
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "user",
    "avatarUrl": "https://...",
    "emailVerified": true,
    "twoFactorEnabled": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

---

## 3. Workspaces

### 3.1 List Workspaces

List all workspaces the user is a member of.

**Endpoint:** `GET /api/v1/workspaces`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "data": [
    {
      "id": "ws-123",
      "name": "My Company",
      "slug": "my-company",
      "logoUrl": "https://...",
      "role": "owner",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 3.2 Create Workspace

Create a new workspace.

**Endpoint:** `POST /api/v1/workspaces`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "My New Company",
  "slug": "my-new-company"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "ws-456",
    "name": "My New Company",
    "slug": "my-new-company",
    "logoUrl": null,
    "role": "owner",
    "createdAt": "2024-01-16T14:20:00Z"
  }
}
```

### 3.3 Get Workspace

Get a specific workspace.

**Endpoint:** `GET /api/v1/workspaces/:id`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (200):**

```json
{
  "data": {
    "id": "ws-123",
    "name": "My Company",
    "slug": "my-company",
    "logoUrl": "https://...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3.4 Update Workspace

Update workspace details.

**Endpoint:** `PATCH /api/v1/workspaces/:id`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Request Body:**

```json
{
  "name": "Updated Company Name",
  "logoUrl": "https://new-logo.com/logo.png"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "ws-123",
    "name": "Updated Company Name",
    "slug": "my-company",
    "logoUrl": "https://new-logo.com/logo.png",
    "updatedAt": "2024-01-16T15:30:00Z"
  }
}
```

### 3.5 Delete Workspace

Delete a workspace.

**Endpoint:** `DELETE /api/v1/workspaces/:id`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (204):** No content

### 3.6 List Members

List all members of a workspace.

**Endpoint:** `GET /api/v1/workspaces/:id/members`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (200):**

```json
{
  "data": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner",
      "joinedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 3.7 Add Member

Add a member to a workspace.

**Endpoint:** `POST /api/v1/workspaces/:id/members`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Request Body:**

```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "user-456",
    "email": "newmember@example.com",
    "name": "New Member",
    "role": "member",
    "joinedAt": "2024-01-16T16:00:00Z"
  }
}
```

### 3.8 Remove Member

Remove a member from a workspace.

**Endpoint:** `DELETE /api/v1/workspaces/:id/members/:userId`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (204):** No content

### 3.9 Update Member Role

Update a member's role.

**Endpoint:** `PATCH /api/v1/workspaces/:id/members/:userId`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Request Body:**

```json
{
  "role": "admin"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "user-456",
    "email": "member@example.com",
    "role": "admin"
  }
}
```

---

## 4. Invitations

### 4.1 Create Invitation

Create an invitation to a workspace.

**Endpoint:** `POST /api/v1/workspaces/:id/invitations`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Request Body:**

```json
{
  "email": "invited@example.com",
  "role": "member"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "inv-123",
    "email": "invited@example.com",
    "role": "member",
    "expiresAt": "2024-01-23T16:00:00Z",
    "token": "invite-token-abc123"
  }
}
```

### 4.2 List Invitations

List pending invitations for a workspace.

**Endpoint:** `GET /api/v1/workspaces/:id/invitations`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (200):**

```json
{
  "data": [
    {
      "id": "inv-123",
      "email": "invited@example.com",
      "role": "member",
      "expiresAt": "2024-01-23T16:00:00Z",
      "createdAt": "2024-01-16T16:00:00Z"
    }
  ]
}
```

### 4.3 Accept Invitation

Accept a workspace invitation.

**Endpoint:** `POST /api/v1/invitations/:token/accept`

**Request Body:**

```json
{
  "userId": "user-123"
}
```

**Response (200):**

```json
{
  "data": {
    "success": true,
    "workspace": {
      "id": "ws-123",
      "name": "My Company"
    }
  }
}
```

---

## 5. Billing

### 5.1 Create Checkout

Create a Stripe checkout session.

**Endpoint:** `POST /api/v1/billing/checkout`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Request Body:**

```json
{
  "variantId": "variant_123",
  "redirectUrl": "https://app.example.com/billing"
}
```

**Response (200):**

```json
{
  "data": {
    "url": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
}
```

### 5.2 Get Subscription

Get current subscription status.

**Endpoint:** `GET /api/v1/billing/subscription`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (200):**

```json
{
  "data": {
    "status": "active",
    "planId": "plan_pro",
    "variantId": "variant_pro",
    "currentPeriodEnd": "2024-02-15T10:30:00Z"
  }
}
```

### 5.3 Get Customer Portal

Get Stripe customer portal URL.

**Endpoint:** `POST /api/v1/billing/portal`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (200):**

```json
{
  "data": {
    "url": "https://billing.stripe.com/session/..."
  }
}
```

### 5.4 List Invoices

List billing history.

**Endpoint:** `GET /api/v1/billing/invoices`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (200):**

```json
{
  "data": [
    {
      "id": "in_123",
      "number": "INV-001",
      "amount": 2900,
      "currency": "usd",
      "status": "paid",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 5.5 Webhook

Handle billing provider webhooks.

**Endpoint:** `POST /api/v1/billing/webhook`

**Headers:** `Stripe-Signature: <signature>`

**Response (200):**

```json
{
  "received": true
}
```

---

## 6. Tasks

### 6.1 List Tasks

List tasks in a workspace.

**Endpoint:** `GET /api/v1/workspaces/:id/tasks`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Query Parameters:**

- `status`: Filter by status (pending, in_progress, completed)
- `assignedTo`: Filter by assignee
- `limit`: Max results (default 20)
- `cursor`: Pagination cursor

**Response (200):**

```json
{
  "data": [
    {
      "id": "task-123",
      "title": "Implement login",
      "description": "Add OAuth login",
      "status": "in_progress",
      "priority": "high",
      "assignedTo": "user-123",
      "dueDate": "2024-01-20T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "nextCursor": "cursor-abc123"
  }
}
```

### 6.2 Create Task

Create a new task.

**Endpoint:** `POST /api/v1/workspaces/:id/tasks`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Request Body:**

```json
{
  "title": "New feature",
  "description": "Implement new feature",
  "priority": "medium",
  "assignedTo": "user-456",
  "dueDate": "2024-01-25T10:30:00Z"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "task-789",
    "title": "New feature",
    "description": "Implement new feature",
    "status": "pending",
    "priority": "medium",
    "assignedTo": "user-456",
    "dueDate": "2024-01-25T10:30:00Z",
    "createdAt": "2024-01-16T14:20:00Z"
  }
}
```

### 6.3 Update Task

Update a task.

**Endpoint:** `PATCH /api/v1/workspaces/:id/tasks/:taskId`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Request Body:**

```json
{
  "status": "completed",
  "assignedTo": "user-789"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "task-789",
    "title": "New feature",
    "status": "completed",
    "updatedAt": "2024-01-16T16:00:00Z"
  }
}
```

### 6.4 Delete Task

Delete a task.

**Endpoint:** `DELETE /api/v1/workspaces/:id/tasks/:taskId`

**Headers:**

- `Authorization: Bearer <token>`
- `X-Workspace-ID: ws-123`

**Response (204):** No content

---

## 7. Health

### 7.1 Health Check

Check service health.

**Endpoint:** `GET /api/v1/health`

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-16T14:20:00Z",
  "checks": {
    "database": "up",
    "redis": "up"
  }
}
```

### 7.2 Liveness

Check if service is alive.

**Endpoint:** `GET /api/v1/health/live`

**Response (200):**

```json
{
  "status": "ok"
}
```

### 7.3 Readiness

Check if service is ready to accept traffic.

**Endpoint:** `GET /api/v1/health/ready`

**Response (200):**

```json
{
  "status": "ok"
}
```

---

## 8. Error Responses

### 8.1 Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

### 8.2 Common Error Codes

| Code                  | HTTP Status | Description              |
| --------------------- | ----------- | ------------------------ |
| `UNAUTHORIZED`        | 401         | Authentication required  |
| `FORBIDDEN`           | 403         | Insufficient permissions |
| `NOT_FOUND`           | 404         | Resource not found       |
| `VALIDATION_ERROR`    | 400         | Invalid request data     |
| `CONFLICT`            | 409         | Resource already exists  |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests        |
| `INTERNAL_ERROR`      | 500         | Server error             |

---

## 9. Rate Limiting

### 9.1 Rate Limit Headers

All responses include rate limit headers:

| Header                  | Description                      |
| ----------------------- | -------------------------------- |
| `X-RateLimit-Limit`     | Maximum requests allowed         |
| `X-RateLimit-Remaining` | Remaining requests               |
| `X-RateLimit-Reset`     | Unix timestamp when limit resets |

### 9.2 Rate Limits

| Plan       | Requests/Minute |
| ---------- | --------------- |
| Free       | 100             |
| Pro        | 1,000           |
| Enterprise | 10,000          |
