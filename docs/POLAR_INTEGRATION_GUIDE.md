# Polar.sh Integration Guide for Edge-Native Applications

This guide outlines how to implement **Polar.sh** as a primary billing provider in a multi-tenant, edge-native architecture (Cloudflare Workers + Neon PostgreSQL).

---

## 1. Overview

Polar.sh is used to handle checkouts, subscriptions, and billing lifecycle. The integration is designed to be:
- **Edge-Ready**: Uses the official `@polar-sh/sdk` which is compatible with V8 Isolates.
- **Provider-Agnostic**: Implements a `PaymentProvider` interface to allow switching gateways.
- **Secure**: Implements HMAC signature validation and at-rest encryption for customer IDs.

---

## 2. Environment Variables

Add the following keys to your Cloudflare Worker bindings (or `.env` file):

```bash
# Polar.sh Access Token (from Dashboard > Settings > API Tokens)
POLAR_ACCESS_TOKEN="polar_at_..."

# Polar.sh Webhook Secret (from Dashboard > Settings > Webhooks)
POLAR_WEBHOOK_SECRET="whsec_..."

# Environment State (sandbox for local dev, production for live)
NODE_ENV="development" # or "production"
```

In `env.ts`, ensure the types are properly defined:

```typescript
export type Bindings = {
  POLAR_ACCESS_TOKEN: string;
  POLAR_WEBHOOK_SECRET: string;
  BILLING_PROVIDER: "polar";
  NODE_ENV: "development" | "production" | "test";
};
```

---

## 3. Database Schema

Using Drizzle ORM, you need two main tables to track billing state:

### Subscriptions Enum
```typescript
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialling",
  "past_due",
  "cancelled",
  "unpaid",
  "paused",
]);
```

### Customers Table
Maps your internal workspace/user IDs to Polar's customer IDs.
```typescript
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").unique().notNull(),
  providerCustomerId: text("provider_customer_id").notNull(), // Should be encrypted
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Subscriptions Table
Tracks the current plan and status.
```typescript
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull(),
  providerSubscriptionId: text("provider_subscription_id").notNull().unique(),
  planId: text("plan_id").notNull(),
  variantId: text("variant_id").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  nextPaymentAt: timestamp("next_payment_at"),
  endsAt: timestamp("ends_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## 4. Implementation

### Provider Layer (`polar.provider.ts`)
Encapsulates Polar SDK logic behind an interface.

```typescript
import { Polar } from "@polar-sh/sdk";
import { validateEvent } from "@polar-sh/sdk/webhooks";

export const createPolarProvider = (accessToken: string, webhookSecret: string, server: "sandbox" | "production" = "production") => {
  const polar = new Polar({ accessToken, server });

  return {
    async createCheckout(params: CheckoutParams) {
      const checkout = await polar.checkouts.create({
        products: [params.variantId],
        successUrl: params.redirectUrl,
        customerEmail: params.userEmail,
        metadata: {
          user_id: params.userId,
          workspace_id: params.workspaceId,
        },
      });
      return { url: checkout.url };
    },

    async verifyWebhook(headers: Record<string, string>, rawBody: string) {
      try {
        validateEvent(rawBody, headers, webhookSecret);
        return true;
      } catch (error) {
        return false;
      }
    }
  };
};
```

### Service Layer (`billing.service.ts`)
Handles normalization and database persistence. **Note:** Polar uses `trialing`, ensure you map it to your DB enum (e.g., `trialling`).

```typescript
normalizePolarPayload(payload: any) {
  const { data } = payload;
  
  const statusMap: Record<string, string> = {
    trialing: "trialling",
    active: "active",
    // ... other maps
  };

  return {
    workspaceId: data.metadata.workspace_id,
    providerSubscriptionId: data.id,
    status: statusMap[data.status] || "active",
    // ... map remaining fields
  };
}
```

---

## 5. Webhook Handling

Implement a secure endpoint in Hono to listen for Polar events.

```typescript
async handleWebhook(c: Context) {
  const headers = c.req.header();
  const rawBody = await c.req.text();
  const provider = createPolarProvider(c.env.POLAR_ACCESS_TOKEN, c.env.POLAR_WEBHOOK_SECRET);

  if (!await provider.verifyWebhook(headers, rawBody)) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(rawBody);
  if (payload.type.startsWith("subscription.")) {
    const data = billingService.normalizePolarPayload(payload);
    await billingService.syncSubscription(data);
  }

  return c.json({ received: true }, 200);
}
```

---

## 6. Security Best Practices

1.  **Encryption at Rest**: Always encrypt the `providerCustomerId` before storing it in the database. Use AES-GCM for this.
2.  **WaitUntil**: Use `c.executionCtx.waitUntil` for non-blocking operations like audit tracking during checkout creation.
3.  **Idempotency**: Check if the subscription status has actually changed before performing a DB update to save I/O.
4.  **Raw Body**: Always use `c.req.text()` for webhook validation to ensure the signature matches exactly.

---

## 7. Useful Resources

- [Polar.sh Documentation](https://docs.polar.sh)
- [Polar SDK on GitHub](https://github.com/polarsource/polar-js)
- [Standard Webhooks Spec](https://www.standardwebhooks.com/)
