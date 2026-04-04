import { AppError } from "@workspace/types";
import type { Context, Next } from "hono";
import type { AppContext } from "../types/env";
import {
  WorkspaceRepository,
  PermissionRepository,
} from "@workspace/db";
import { CACHE_KEYS } from "../services/cache.service";

/**
 * Middleware to enforce workspace-level access control.
 * Extracts the workspace ID from the 'x-workspace-id' header and verifies
 * the authenticated user's membership.
 * Uses Cloudflare KV for edge-caching to reduce database lookup latency.
 *
 * @throws {AppError} 403 if membership is invalid or missing.
 * @throws {AppError} 400 if workspace header is missing.
 */
export const workspaceGuard = async (
  c: Context<AppContext>,
  next: Next,
): Promise<void> => {
  const userId = c.get("userId");
  const workspaceId = c.req.header("x-workspace-id");

  if (!workspaceId) {
    throw new AppError(
      "Missing 'x-workspace-id' header.",
      400,
      "MISSING_WORKSPACE_HEADER",
    );
  }

  const { cache, billing, db } = c.get("services");
  const cacheKey = CACHE_KEYS.userMembership(userId, workspaceId);
  const shouldBustCache = c.req.header("x-cache-bust") === "true";

  // 1. Check Cache-Aside Layer
  let [membershipContext, planContext] = shouldBustCache
    ? [null, null]
    : await Promise.all([
        cache.get<{ role: string; permissions: string[] }>(cacheKey),
        cache.get<string>(CACHE_KEYS.workspacePlan(workspaceId)),
      ]);

  if (!membershipContext) {
    console.log(
      `[WorkspaceGuard] Cache miss for user ${userId} in workspace ${workspaceId}. Fetching from DB...`,
    );
    // 2. Fetch from Source-of-Truth
    const membership = await WorkspaceRepository.getMembership(
      db,
      userId,
      workspaceId,
    );

    if (!membership) {
      console.error(
        `[WorkspaceGuard] User ${userId} is not a member of ${workspaceId}`,
      );
      throw new AppError(
        "You do not have permission to access this workspace.",
        403,
        "FORBIDDEN",
        true,
      );
    }

    const permissions = await PermissionRepository.getEffectivePermissions(
      db,
      userId,
      workspaceId,
    );

    membershipContext = {
      role: membership.role,
      permissions,
    };

    // 3. Populate Cache (TTL 1 hour)
    await cache.set(cacheKey, membershipContext, 3600);
  }

  if (!planContext) {
    console.log(`[WorkspaceGuard] Fetching plan for workspace ${workspaceId}`);
    const result = await billing.getSubscriptionStatus(workspaceId);
    planContext = result.hasActiveSubscription
      ? result.subscription?.planId || "free"
      : "free";

    await cache.set(CACHE_KEYS.workspacePlan(workspaceId), planContext, 3600);
  }

  // Set identity in context for downstream handlers/controllers
  c.set("workspaceId", workspaceId);
  c.set("workspaceRole", membershipContext.role);
  c.set("permissions", membershipContext.permissions);
  c.set("workspacePlan", planContext);

  return await next();
};
