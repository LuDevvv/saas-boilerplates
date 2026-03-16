import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  checkoutRequestSchema,
  checkoutSuccessResponseSchema,
  portalSuccessResponseSchema,
  subscriptionStatusResponseSchema,
  InvoiceListSuccessResponseSchema,
  ErrorSchema,
} from "@workspace/validators";
import { BillingController } from "./billing.controller";
import { authGuard } from "../../common/middlewares/authGuard";
import { workspaceGuard } from "../../common/middlewares/workspaceGuard";
import { requirePermission } from "../../common/middlewares/permissionGuard";
import { rateLimit } from "../../common/middlewares/rateLimiter";
import type { AppContext } from "../../common/types/env";

const app = new OpenAPIHono<AppContext>();

const checkoutRoute = createRoute({
  method: "post",
  path: "/checkout",
  tags: ["Billing"],
  summary: "Create a checkout session",
  description:
    "Initializes a payment session with the provider. Requires a valid JWT and an active workspace identity.",
  middleware: [
    rateLimit({ window: 60, limit: 10, keyPrefix: "billing" }),
    authGuard,
    workspaceGuard,
    requirePermission("billing.manage"),
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: checkoutRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Checkout setup successfully",
      content: {
        "application/json": { schema: checkoutSuccessResponseSchema },
      },
    },
    400: {
      description: "Invalid request payload",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized request",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const subscriptionStatusRoute = createRoute({
  method: "get",
  path: "/subscription",
  tags: ["Billing"],
  summary: "Get subscription status",
  description: "Returns active subscription details for the current workspace.",
  middleware: [authGuard, workspaceGuard] as const,
  responses: {
    200: {
      description: "Status retrieved",
      content: {
        "application/json": { schema: subscriptionStatusResponseSchema },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const portalRoute = createRoute({
  method: "post",
  path: "/portal",
  tags: ["Billing"],
  summary: "Get customer portal URL",
  description: "Generates a link to manage billing and subscriptions.",
  middleware: [
    rateLimit({ window: 60, limit: 5, keyPrefix: "billing-portal" }),
    authGuard,
    workspaceGuard,
    requirePermission("billing.manage"),
  ] as const,
  responses: {
    200: {
      description: "Portal URL generated",
      content: { "application/json": { schema: portalSuccessResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const listInvoicesRoute = createRoute({
  method: "get",
  path: "/invoices",
  tags: ["Billing"],
  summary: "List billing history",
  description:
    "Returns a chronological list of invoices for the current workspace.",
  middleware: [
    rateLimit({ window: 60, limit: 10, keyPrefix: "billing-invoices" }),
    authGuard,
    workspaceGuard,
    requirePermission("billing.read"),
  ] as const,
  responses: {
    200: {
      description: "Invoices retrieved successfully",
      content: {
        "application/json": { schema: InvoiceListSuccessResponseSchema },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

/**
 * Router managing all subscription and payment related endpoints.
 * Integrates with Polar.sh as the primary payment provider.
 */
export const billingRouter = app
  .openapi(checkoutRoute, (c) => BillingController.createCheckout(c))
  .openapi(subscriptionStatusRoute, (c) =>
    BillingController.getSubscriptionStatus(c),
  )
  .openapi(portalRoute, (c) => BillingController.getCustomerPortal(c))
  .openapi(listInvoicesRoute, (c) => BillingController.listInvoices(c))
  /**
   * Webhook receiver for Polar.sh payment events.
   * Bypasses JWT auth as it is verified via HMAC signatures internally.
   * Non-OpenAPI documented endpoint used for provider-to-server callbacks.
   */
  .post("/webhook", (c) => BillingController.handleWebhook(c));
