import type { Context, Next, MiddlewareHandler } from "hono";
import type { AppContext } from "../types/env";
import { AppError } from "@workspace/types";
import { createDbClient, PermissionRepository } from "@workspace/db";

/**
 * Factory for creating permission-based access control middleware.
 * Verifies if the authenticated user has the required capability within the active workspace.
 *
 * @param permission - The unique string identifier for the capability (e.g. 'workspace:write')
 * @returns {MiddlewareHandler} Hono middleware
 */
export const requirePermission = (
  permission: string,
): MiddlewareHandler<AppContext> => {
  return async (c: Context<AppContext>, next: Next): Promise<void> => {
    const workspaceId = c.get("workspaceId");
    const permissions = c.get("permissions");

    if (!workspaceId || !permissions) {
      throw new AppError(
        "Access context missing. Ensure workspaceGuard is applied before requirePermission.",
        400,
        "MISSING_WORKSPACE_CONTEXT",
      );
    }

    const isAuthorized = permissions.includes(permission);

    if (!isAuthorized) {
      // Optional: Publish directly to audit trails via Queues regarding failed attempts
      throw new AppError(
        `Unauthorized. Missing required permission: ${permission}`,
        403,
        "FORBIDDEN",
      );
    }

    await next();
  };
};
