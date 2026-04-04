import type { Context } from "hono";
import { successResponse } from "../../common/responses";
import { AppError } from "@workspace/types";
import {
  UserRepository,
  WorkspaceRepository,
  accounts,
  eq,
  createDbClient,
  type Workspace,
} from "@workspace/db";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
} from "@workspace/validators";
import { createUserService } from "./user.service";
import { createStorageService } from "../../common/services/storage.service";
import type { AppContext } from "../../common/types/env";
import {
  createCacheService,
  CACHE_KEYS,
} from "../../common/services/cache.service";

/**
 * Controller for managing User identity and personal settings.
 * Handles profile retrieval, workspace association lookup, and metadata updates.
 */
export const UserController = {
  /**
   * Retrieves the complete profile of the authenticated user.
   * Includes joined workspaces and linked multi-account OAuth providers.
   * Uses KV caching for workspace memberships to optimize read performance.
   *
   * @param c - Hono application context
   * @returns A JSON response with the user's identity and environment
   */
  async getProfile(c: Context<AppContext>) {
    const userId = c.get("userId");
    const cache = createCacheService(c.env.CACHE_KV);
    const workspacesKey = CACHE_KEYS.userWorkspaces(userId);

    // Warm cache lookup for workspace memberships
    let workspaces =
      await cache.get<(Workspace & { role: string })[]>(workspacesKey);

    const db = createDbClient(c.env.DATABASE_URL);

    if (!workspaces) {
      workspaces = await WorkspaceRepository.getUserWorkspaces(db, userId);
      await cache.set(workspacesKey, workspaces, 3600);
    }

    const user = await UserRepository.findByEmail(db, c.get("user").email);
    if (!user) throw new AppError("User not found.", 404, "NOT_FOUND");

    const userAccounts = await db
      .select({ provider: accounts.provider })
      .from(accounts)
      .where(eq(accounts.userId, userId));

    return c.json(
      successResponse({
        id: user.id,
        email: user.email,
        name: user.name ?? "User",
        role: user.role,
        avatarUrl: user.avatarUrl,
        twoFactorEnabled: user.twoFactorEnabled,
        workspaces: workspaces.map((w) => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          logoUrl: w.logoUrl,
          role: w.role as "owner" | "admin" | "member",
          createdAt: new Date(w.createdAt).toISOString(),
        })),
        accounts: userAccounts.map((a) => a.provider),
      }),
      200,
    );
  },

  /**
   * Updates partial personal information for the current user.
   * Invalidates relevant caches upon successful update.
   *
   * @param c - Hono application context
   * @returns A JSON response with the updated user profile
   */
  async updateProfile(c: Context<AppContext>) {
    const userId = c.get("userId");
    const data = (await c.req.json()) as UpdateProfileInput;

    const db = createDbClient(c.env.DATABASE_URL);
    const service = createUserService(db, c.env.CACHE_KV);

    const updatedUser = await service.updateProfile(userId, data);

    if (!updatedUser)
      throw new AppError("User update failed.", 400, "UPDATE_FAILED");

    return c.json(
      successResponse({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name ?? "User",
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
      }),
      200,
    );
  },

  /**
   * Updates the user password after verifying current credentials.
   *
   * @param c - Hono application context
   * @returns A JSON response confirming the update
   */
  async changePassword(c: Context<AppContext>) {
    const userId = c.get("userId");
    const data = (await c.req.json()) as ChangePasswordInput;

    const db = createDbClient(c.env.DATABASE_URL);
    const service = createUserService(db, c.env.CACHE_KV);

    await service.changePassword(userId, data);

    return c.json(
      successResponse({ message: "Password updated successfully" }),
      200,
    );
  },

  /**
   * Permanently deletes the user account and associated data.
   * Follows GDPR "Right to be Forgotten" principles.
   *
   * @param c - Hono application context
   * @returns A JSON response confirming deletion
   */
  async deleteAccount(c: Context<AppContext>) {
    const userId = c.get("userId");

    const db = createDbClient(c.env.DATABASE_URL);
    const service = createUserService(db, c.env.CACHE_KV);

    await service.deleteAccount(userId);

    return c.json(
      successResponse({ message: "Account deleted successfully" }),
      200,
    );
  },

  /**
   * Uploads and sets a new avatar image for the authenticated user.
   *
   * @param c - Hono application context
   * @returns A JSON response with the updated user profile including the new avatarUrl
   */
  async uploadAvatar(c: Context<AppContext>) {
    const userId = c.get("userId");
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new AppError("No file uploaded", 400, "BAD_REQUEST");
    }

    const db = createDbClient(c.env.DATABASE_URL);
    const storage = createStorageService({
      R2_ACCESS_KEY_ID: c.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: c.env.R2_SECRET_ACCESS_KEY,
      R2_ENDPOINT: c.env.R2_ENDPOINT,
      R2_BUCKET_NAME: c.env.R2_BUCKET_NAME,
      R2_BUCKET: c.env.R2_BUCKET,
    });

    const extension = file.name.split(".").pop() || "png";
    const key = `avatars/${userId}-${Date.now()}.${extension}`;

    // Upload to storage
    await storage.put(key, await file.arrayBuffer(), file.type);

    // Generate public URL
    const avatarUrl = `${c.env.R2_PUBLIC_URL}/${key}`;

    // Update user record
    const service = createUserService(db, c.env.CACHE_KV);
    const updatedUser = await service.updateProfile(userId, { avatarUrl });

    if (!updatedUser) {
      throw new AppError("Failed to update user profile", 500, "UPDATE_FAILED");
    }

    return c.json(
      successResponse({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name ?? "User",
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
      }),
      200,
    );
  },
};
