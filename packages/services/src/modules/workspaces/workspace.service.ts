import { type Database, WorkspaceRepository } from "@workspace/db";
import { AppError } from "@workspace/types";
import {
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
} from "@workspace/validators";
import type { ICacheService } from "../../common/interfaces";
import { CACHE_KEYS } from "../../common/interfaces";

/**
 * Service for managing workspace lifecycle and multi-tenant isolation.
 * Orchestrates database operations and cache invalidation.
 */
export const createWorkspaceService = (db: Database, cache?: ICacheService) => {
  return {
    /**
     * Creates a new workspace and sets the creator as the owner.
     */
    createWorkspace: async (userId: string, data: CreateWorkspaceInput) => {
      try {
        const { workspace } = await WorkspaceRepository.createWorkspace(
          db,
          userId,
          {
            name: data.name,
            slug: data.slug,
            logoUrl: data.logoUrl,
          },
        );

        if (workspace && cache) {
          await cache.delete(CACHE_KEYS.userWorkspaces(userId));
        }

        return workspace;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new AppError(
            "A workspace with this slug already exists.",
            400,
            "DUPLICATE_SLUG",
          );
        }
        throw error;
      }
    },

    getUserWorkspaces: async (userId: string) => {
      return await WorkspaceRepository.getUserWorkspaces(db, userId);
    },

    updateWorkspace: async (
      workspaceId: string,
      data: UpdateWorkspaceInput,
    ) => {
      const updated = await WorkspaceRepository.updateWorkspace(
        db,
        workspaceId,
        data,
      );

      if (!updated) {
        throw new AppError("Failed to update workspace.", 500, "UPDATE_FAILED");
      }

      if (cache) {
        // Invalidate global workspace metadata cache
        await cache.delete(CACHE_KEYS.workspaceMeta(workspaceId));
      }

      return updated;
    },

    /**
     * Returns all members with their profiles for the specified workspace.
     */
    listMembers: async (workspaceId: string) => {
      return await WorkspaceRepository.getWorkspaceMembers(db, workspaceId);
    },

    /**
     * Removes a member from the workspace and invalidates their related caches.
     */
    removeMember: async (
      workspaceId: string,
      userId: string,
      actorRole: string,
    ) => {
      const success = await WorkspaceRepository.removeMember(
        db,
        workspaceId,
        userId,
        actorRole,
      );

      if (success && cache) {
        // Invalidate the removed user's workspaces list
        await cache.delete(CACHE_KEYS.userWorkspaces(userId));
        // Invalidate session to drop privileges immediately
        await cache.delete(CACHE_KEYS.userSession(userId));
      }

      return success;
    },

    /**
     * Updates a member's role and invalidates their related caches.
     */
    updateMemberRole: async (
      workspaceId: string,
      userId: string,
      role: string,
      actorRole: string,
    ) => {
      const success = await WorkspaceRepository.updateMemberRole(
        db,
        workspaceId,
        userId,
        role,
        actorRole,
      );

      if (success && cache) {
        await cache.delete(CACHE_KEYS.userWorkspaces(userId));
        await cache.delete(CACHE_KEYS.userSession(userId));
      }

      return success;
    },
  };
};

export type WorkspaceService = ReturnType<typeof createWorkspaceService>;
