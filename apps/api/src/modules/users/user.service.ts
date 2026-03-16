import type { Database } from "@workspace/db";
import { UserRepository } from "@workspace/db";
import { AppError } from "@workspace/types";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
} from "@workspace/validators";
import {
  createCacheService,
  CACHE_KEYS,
} from "../../common/services/cache.service";
import { hashPassword, verifyPassword } from "../../common/utils/crypto";
import type { KVNamespace } from "@cloudflare/workers-types";

/**
 * Service for handling User-related business logic.
 * Encapsulates profile management, security updates, and account lifecycle.
 */
export const createUserService = (db: Database, kv?: KVNamespace) => {
  return {
    /**
     * Updates user profile metadata (name, avatar).
     */
    async updateProfile(userId: string, data: UpdateProfileInput) {
      const updated = await UserRepository.update(db, userId, {
        name: data.name,
        avatarUrl: data.avatarUrl,
      });

      if (updated && kv) {
        const cache = createCacheService(kv);
        await cache.delete(CACHE_KEYS.userSession(userId));
        await cache.delete(CACHE_KEYS.userWorkspaces(userId));
      }

      return updated;
    },

    /**
     * Updates the user's password after verifying the current one.
     */
    async changePassword(userId: string, data: ChangePasswordInput) {
      const user = await UserRepository.findById(db, userId);
      if (!user || !user.passwordHash) {
        throw new AppError(
          "User not found or using social login.",
          404,
          "NOT_FOUND",
        );
      }

      // Verify current password
      const isValid = await verifyPassword(
        data.currentPassword,
        user.passwordHash,
      );
      if (!isValid) {
        throw new AppError(
          "Invalid current password.",
          400,
          "INVALID_PASSWORD",
        );
      }

      // Hash new password and update
      const newPasswordHash = await hashPassword(data.newPassword);
      await UserRepository.update(db, userId, {
        passwordHash: newPasswordHash,
      });

      if (kv) {
        const cache = createCacheService(kv);
        // Invalidate session to force logout or re-auth if needed
        await cache.delete(CACHE_KEYS.userSession(userId));
      }
    },

    /**
     * Permanently deletes the user account.
     */
    async deleteAccount(userId: string) {
      const user = await UserRepository.findById(db, userId);
      if (!user) throw new AppError("User not found.", 404, "NOT_FOUND");

      await UserRepository.delete(db, userId);

      if (kv) {
        const cache = createCacheService(kv);
        await cache.delete(CACHE_KEYS.userSession(userId));
        await cache.delete(CACHE_KEYS.userWorkspaces(userId));
      }
    },
  };
};
