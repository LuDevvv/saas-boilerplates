import type { Context, Next } from "hono";
import type { AppContext } from "../types/env";
import { createDbClient, SubscriptionRepository } from "@workspace/db";
import { AppError } from "@workspace/types";

/**
 * Middleware to protect "Pro" features by verifying subscription status.
 * Checks if the active workspace has an 'active' or 'trialling' subscription.
 *
 * @throws {AppError} 402 if subscription is invalid or inactive.
 * @throws {AppError} 400 if workspaceId is missing from context.
 */
export const subscriptionGuard = async (
  c: Context<AppContext>,
  next: Next,
): Promise<void> => {
  const workspaceId = c.get("workspaceId");

  if (!workspaceId) {
    throw new AppError(
      "Multi-tenant context missing. Ensure workspaceGuard is applied before subscriptionGuard.",
      400,
      "MISSING_WORKSPACE_CONTEXT",
    );
  }

  const db = createDbClient(c.env.DATABASE_URL);
  const subscription = await SubscriptionRepository.getActiveSubscription(
    db,
    workspaceId,
  );

  // Allow access only if status is strictly 'active' or 'trialling'
  // Note: getActiveSubscription already filters for 'active'.
  // If we need to support 'trialling', we might need to update the repository or check both here.
  if (!subscription || !["active", "trialling"].includes(subscription.status)) {
    throw new AppError(
      "Payment required. This feature requires an active workspace subscription.",
      402,
      "PAYMENT_REQUIRED",
    );
  }

  return await next();
};
