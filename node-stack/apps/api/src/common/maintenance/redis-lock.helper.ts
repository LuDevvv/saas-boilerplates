import { randomUUID } from "crypto";

import type { CacheService } from "@node-stack/cache";

/**
 * Run `work` only if this caller successfully acquires the named lock
 * in Redis. Returns the result of `work`, or null if another instance
 * already holds the lock. The lock is released via a conditional
 * Lua script on CacheService so a slow-running holder cannot delete
 * a successor's lock once its lease has expired.
 */
export async function withRedisLock<T>(
  cache: CacheService,
  key: string,
  ttlSeconds: number,
  work: () => Promise<T>,
): Promise<T | null> {
  const token = randomUUID();
  const acquired = await cache.tryAcquireLock(key, ttlSeconds, token);
  if (acquired === null) {
    return null;
  }
  try {
    return await work();
  } finally {
    await cache.releaseLock(key, token);
  }
}
