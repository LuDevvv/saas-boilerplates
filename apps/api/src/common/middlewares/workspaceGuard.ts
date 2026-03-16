import { AppError } from "@workspace/types";
import type { Context, Next } from "hono";
import type { AppContext } from "../types/env";
import {
  createDbClient,
  WorkspaceRepository,
  PermissionRepository,
} from "@workspace/db";
import { createCacheService, CACHE_KEYS } from "../services/cache.service";

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

  const cache = createCacheService(c.env.CACHE_KV);
  const cacheKey = CACHE_KEYS.userMembership(userId, workspaceId);
  const shouldBustCache = c.req.header("x-cache-bust") === "true";

  // 1. Check Cache-Aside Layer
  let membershipContext = shouldBustCache
    ? null
    : await cache.get<{ role: string; permissions: string[] }>(cacheKey);

  if (!membershipContext) {
    console.log(
      `[WorkspaceGuard] Cache miss for user ${userId} in workspace ${workspaceId}. Fetching from DB...`,
    );
    // 2. Fetch from Source-of-Truth
    const db = createDbClient(c.env.DATABASE_URL);
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
      );
    }

    const permissions = await PermissionRepository.getEffectivePermissions(
      db,
      userId,
      workspaceId,
    );
    console.log(
      `[WorkspaceGuard] Fetched ${permissions.length} permissions for role ${membership.role}`,
    );

    membershipContext = {
      role: membership.role,
      permissions,
    };

    // 3. Populate Cache (TTL 1 hour)
    await cache.set(cacheKey, membershipContext, 3600);
  } else {
    console.log(
      `[WorkspaceGuard] Cache hit for user ${userId}. Permissions: ${membershipContext.permissions.length}`,
    );
  }

  // Set identity in context for downstream handlers/controllers
  c.set("workspaceId", workspaceId);
  c.set("workspaceRole", membershipContext.role);
  c.set("permissions", membershipContext.permissions);

  return await next();
};
