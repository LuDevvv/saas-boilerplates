import type { Context } from "hono";
import type { AppContext } from "../../common/types/env";
import { AppError } from "@workspace/types";
import { successResponse } from "../../common/responses";
import {
  createBillingService,
  createPolarProvider,
  type PaymentProvider,
} from "@workspace/services";
import type { CheckoutRequestDTO } from "@workspace/validators";
import { createDbClient } from "@workspace/db";

/**
 * Helper to instantiate the Polar payment provider.
 *
 * @param c - Hono application context
 * @returns An instance of the Polar payment provider
 */
const getActiveProvider = (c: Context<AppContext>): PaymentProvider => {
  return createPolarProvider(
    c.env.POLAR_ACCESS_TOKEN,
    c.env.POLAR_WEBHOOK_SECRET,
    c.env.NODE_ENV === "development" ? "sandbox" : "production",
  );
};

/**
 * Controller for managing billing and payment workflows via Polar.sh.
 * Efficiently handles checkouts, webhooks, and subscription status on the Edge.
 */
export const BillingController = {
  /**
   * Initializes a new payment checkout session for a specific product.
   *
   * @param c - Hono application context
   * @throws {AppError} If the workspace context is missing
   * @returns A JSON response containing the Polar checkout URL
   */
  async createCheckout(c: Context<AppContext>) {
    const body = (await c.req.json()) as CheckoutRequestDTO;
    const user = c.get("user");
    const workspaceId = c.get("workspaceId");

    if (!workspaceId) {
      throw new AppError("Workspace context required.", 400, "BAD_REQUEST");
    }

    const paymentProvider = getActiveProvider(c);

    const checkoutInfo = await paymentProvider.createCheckout({
      userId: user.id,
      workspaceId: workspaceId,
      userEmail: user.email,
      variantId: body.productId,
      redirectUrl: body.redirectUrl,
    });

    // Background audit tracking
    const { audit } = c.get("services");
    c.executionCtx.waitUntil(
      audit.trackActionFromContext(c, {
        action: "billing.checkout_created",
        entityType: "checkout",
        metadata: { variantId: body.productId },
      }),
    );

    return c.json(
      successResponse({
        url: checkoutInfo.url,
      }),
      200,
    );
  },

  /**
   * Handles incoming webhook notifications from Polar.sh.
   * Validates cryptographic signatures and synchronizes subscription state.
   *
   * @param c - Hono application context
   * @throws {AppError} If the signature is invalid or missing
   * @returns A 200 OK response to acknowledge receipt
   */
  async handleWebhook(c: Context<AppContext>) {
    const headers = c.req.header();
    const rawBody = await c.req.text();
    const paymentProvider = getActiveProvider(c);

    // Standard Webhooks signature validation
    const isValid = await paymentProvider.verifyWebhook(headers, rawBody);
    if (!isValid) {
      throw new AppError("Invalid signature detected.", 401, "UNAUTHORIZED");
    }

    const payload = JSON.parse(rawBody) as Record<string, any>;
    const db = createDbClient(c.env.DATABASE_URL);
    const billingService = createBillingService(db, c.env.ENCRYPTION_KEY);

    const eventType = payload.type as string;

    // Only sync on subscription events.
    // Order events are ignored for now but we return 200 to acknowledge.
    if (eventType.startsWith("subscription.")) {
      try {
        const standardizedData = billingService.normalizePolarPayload(payload);
        await billingService.syncSubscription(standardizedData);
      } catch (error) {
        console.error(`[Billing] Error syncing ${eventType}:`, error);
        // We still want to return 200 if the payload was invalid or sync failed
        // but the signature was correct, to avoid Polar retrying indefinitely
        // if it's a data mismatch.
      }
    }

    return c.json({ received: true }, 200);
  },

  /**
   * Returns the current subscription status for the active workspace.
   *
   * @param c - Hono application context
   * @throws {AppError} If the workspace context is missing
   * @returns A JSON response with the current plan and status
   */
  async getSubscriptionStatus(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId");

    if (!workspaceId) {
      throw new AppError("Workspace context required.", 400, "BAD_REQUEST");
    }

    const db = createDbClient(c.env.DATABASE_URL);
    const billingService = createBillingService(db);
    const status = await billingService.getSubscriptionStatus(workspaceId);

    return c.json(successResponse(status), 200);
  },

  /**
   * Generates a secure Customer Portal URL for billing management.
   *
   * @param c - Hono application context
   * @throws {AppError} If the workspace context is missing
   * @returns A JSON response with the self-service portal URL
   */
  async getCustomerPortal(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId");

    if (!workspaceId) {
      throw new AppError("Workspace context required.", 400, "BAD_REQUEST");
    }

    const db = createDbClient(c.env.DATABASE_URL);
    const billingService = createBillingService(db, c.env.ENCRYPTION_KEY);
    const provider = getActiveProvider(c);

    const portalResult = await billingService.getCustomerPortalUrl(
      workspaceId,
      provider,
    );

    return c.json(successResponse(portalResult), 200);
  },

  /**
   * Lists the chronological billing history for the active workspace.
   *
   * @param c - Hono application context
   * @returns A JSON response with invoice summaries
   */
  async listInvoices(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId")!;
    const db = createDbClient(c.env.DATABASE_URL);
    const billingService = createBillingService(db, c.env.ENCRYPTION_KEY);
    const provider = getActiveProvider(c);

    const invoices = await billingService.listInvoices(workspaceId, provider);

    return c.json(successResponse(invoices), 200);
  },
};
