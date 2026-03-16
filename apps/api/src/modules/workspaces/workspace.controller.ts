import type { Context } from "hono";
import { AppError } from "@workspace/types";

import { successResponse } from "../../common/responses";
import { createWorkspaceService } from "@workspace/services";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  UpdateMemberRoleInput,
} from "@workspace/validators";
import { createDbClient } from "@workspace/db";
import { createCacheService } from "../../common/services/cache.service";
import { createAnalyticsService } from "../../common/services/analytics.service";
import { createStorageService } from "../../common/services/storage.service";
import { AuditService } from "../../common/services/audit.service";
import type { AppContext } from "../../common/types/env";

/**
 * Controller for managing Workspace lifecycles and settings.
 * Handles organization creation, membership listing, and configuration updates.
 */
export const WorkspaceController = {
  /**
   * Creates a new workspace (organization) for the authenticated user and grants owner permissions.
   *
   * @param c - Hono application context
   * @returns A JSON response with the newly created workspace
   */
  async create(c: Context<AppContext>) {
    const userId = c.get("userId");
    const data = (await c.req.json()) as CreateWorkspaceInput;

    const db = createDbClient(c.env.DATABASE_URL);
    const cache = createCacheService(c.env.CACHE_KV);
    const service = createWorkspaceService(db, cache);

    const workspace = await service.createWorkspace(userId, data);

    // Analytics
    const analytics = createAnalyticsService(c.env);
    c.executionCtx.waitUntil(
      analytics.trackWorkspaceCreated(userId, workspace.id, workspace.name),
    );

    return c.json(
      successResponse({
        ...workspace,
        createdAt: new Date(workspace.createdAt).toISOString(),
      }),
      201,
    );
  },

  /**
   * Retrieves all workspaces where the current user has an active membership.
   *
   * @param c - Hono application context
   * @returns A JSON response containing a list of workspace identities and roles
   */
  async list(c: Context<AppContext>) {
    const userId = c.get("userId");
    const db = createDbClient(c.env.DATABASE_URL);
    const cache = createCacheService(c.env.CACHE_KV);
    const service = createWorkspaceService(db, cache);

    const workspaces = await service.getUserWorkspaces(userId);

    // Map database results to satisfy the Zod/OpenAPI response schema (ISO strings and role enums)
    return c.json(
      successResponse(
        workspaces.map((w) => ({
          ...w,
          createdAt: new Date(w.createdAt).toISOString(),
          role: w.role as "owner" | "admin" | "member",
        })),
      ),
      200,
    );
  },

  /**
   * Updates an existing workspace's overarching metadata settings (e.g. name, logos).
   * Requires update permissions on the specific workspace.
   *
   * @param c - Hono application context
   * @returns A JSON response with the updated workspace record
   */
  async updateSettings(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId")!;
    const data = (await c.req.json()) as UpdateWorkspaceInput;

    const db = createDbClient(c.env.DATABASE_URL);
    const cache = createCacheService(c.env.CACHE_KV);
    const service = createWorkspaceService(db, cache);

    const updated = await service.updateWorkspace(workspaceId, data);

    return c.json(
      successResponse({
        ...updated,
        createdAt: new Date(updated.createdAt).toISOString(),
      }),
      200,
    );
  },

  /**
   * Lists all verified members and their roles for the active workspace.
   *
   * @param c - Hono application context
   * @returns A JSON response with detailed member profiles and membership details
   */
  async listMembers(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId")!;
    const db = createDbClient(c.env.DATABASE_URL);
    const cache = createCacheService(c.env.CACHE_KV);
    const service = createWorkspaceService(db, cache);

    const detailedMembers = await service.listMembers(workspaceId);

    return c.json(successResponse(detailedMembers), 200);
  },

  /**
   * Removes a member from the workspace team.
   *
   * @param c - Hono application context
   * @returns A JSON response confirming removal
   */
  async removeMember(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId")!;
    const memberId = c.req.param("userId");

    const db = createDbClient(c.env.DATABASE_URL);
    const cache = createCacheService(c.env.CACHE_KV);
    const service = createWorkspaceService(db, cache);

    await service.removeMember(workspaceId, memberId);

    return c.json(
      successResponse({ message: "Member removed successfully" }),
      200,
    );
  },

  /**
   * Updates the role/permissions of an existing workspace member.
   *
   * @param c - Hono application context
   * @returns A JSON response confirming the role update
   */
  async updateMemberRole(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId")!;
    const memberId = c.req.param("userId");
    const data = (await c.req.json()) as UpdateMemberRoleInput;

    const db = createDbClient(c.env.DATABASE_URL);
    const cache = createCacheService(c.env.CACHE_KV);
    const service = createWorkspaceService(db, cache);

    await service.updateMemberRole(workspaceId, memberId, data.role);

    return c.json(
      successResponse({ message: "Member role updated successfully" }),
      200,
    );
  },

  /**
   * Retrieves the audit trail for the active workspace.
   *
   * @param c - Hono application context
   * @returns A JSON response with chronological audit logs
   */
  async getAuditLogs(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId")!;
    const db = createDbClient(c.env.DATABASE_URL);

    const logs = await AuditService.getWorkspaceLogs(db, workspaceId);

    return c.json(successResponse(logs), 200);
  },

  /**
   * Uploads and sets a new logo for the workspace.
   *
   * @param c - Hono application context
   * @returns A JSON response with the updated workspace record
   */
  async uploadLogo(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId")!;
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new AppError(
        "No file uploaded. Please provide an image file in the 'file' field.",
        400,
        "MISSING_FILE",
      );
    }

    const db = createDbClient(c.env.DATABASE_URL);
    const cache = createCacheService(c.env.CACHE_KV);
    const storage = createStorageService({
      R2_ACCESS_KEY_ID: c.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: c.env.R2_SECRET_ACCESS_KEY,
      R2_ENDPOINT: c.env.R2_ENDPOINT,
      R2_BUCKET_NAME: c.env.R2_BUCKET_NAME,
      R2_BUCKET: c.env.R2_BUCKET,
    });

    const extension = file.name.split(".").pop() || "png";
    const key = `logos/${workspaceId}-${Date.now()}.${extension}`;

    // Upload to storage
    await storage.put(key, await file.arrayBuffer(), file.type);

    // Generate public URL
    const logoUrl = `${c.env.R2_PUBLIC_URL}/${key}`;

    // Update workspace record
    const service = createWorkspaceService(db, cache);
    const updated = await service.updateWorkspace(workspaceId, { logoUrl });

    return c.json(
      successResponse({
        ...updated,
        createdAt: new Date(updated.createdAt).toISOString(),
      }),
      200,
    );
  },
};
