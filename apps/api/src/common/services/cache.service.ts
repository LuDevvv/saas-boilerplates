import type { KVNamespace } from "@cloudflare/workers-types";

/**
 * Service for managing cached data in Cloudflare KV.
 * Optimized for frequent reads and infrequent writes.
 */
export interface CacheService {
  /**
   * Retrieves a typed value from the cache.
   * @param key - The cache key
   * @returns The parsed value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Stores a value in the cache with an optional TTL.
   * @param key - The cache key
   * @param value - The value to store
   * @param ttl - Expiration time in seconds (default: 3600)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Removes an entry from the cache.
   * @param key - The cache key
   */
  delete(key: string): Promise<void>;
}

/**
 * Factory to create a CacheService instance backed by Cloudflare KV.
 *
 * @param kv - The Cloudflare KV namespace binding
 * @returns A CacheService implemention
 */
export const createCacheService = (kv: KVNamespace): CacheService => {
  return {
    get: async <T>(key: string): Promise<T | null> => {
      try {
        const value = await kv.get(key, "json");
        return value as T;
      } catch (error) {
        console.error(`[CacheService] Error reading key: ${key}`, error);
        return null;
      }
    },

    set: async <T>(
      key: string,
      value: T,
      ttl: number = 3600,
    ): Promise<void> => {
      try {
        await kv.put(key, JSON.stringify(value), {
          expirationTtl: Math.max(60, ttl), // KV min TTL is 60s
        });
      } catch (error) {
        console.error(`[CacheService] Error writing key: ${key}`, error);
      }
    },

    delete: async (key: string): Promise<void> => {
      try {
        await kv.delete(key);
      } catch (error) {
        console.error(`[CacheService] Error deleting key: ${key}`, error);
      }
    },
  };
};

/**
 * Global keys for consistent cache interaction across the application.
 */
export const CACHE_KEYS = {
  /** Stores minimal user profile (name, avatar, email, role) */
  userSession: (userId: string) => `user:session:${userId}`,

  /** Stores list of workspaces a user belongs to */
  userWorkspaces: (userId: string) => `user:workspaces:${userId}`,

  /** Stores workspace identity (name, slug, logo) */
  workspaceMeta: (workspaceId: string) => `workspace:meta:${workspaceId}`,

  /** Stores combined user role and permissions for a specific workspace */
  userMembership: (userId: string, workspaceId: string) =>
    `user:membership:${userId}:${workspaceId}`,
};
