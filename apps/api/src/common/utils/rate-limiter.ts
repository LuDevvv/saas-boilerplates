import type { KVNamespace } from "@cloudflare/workers-types";

/**
 * Result of a rate limit check.
 */
export interface RateLimitResult {
  /** Whether the request is allowed. */
  success: boolean;
  /** The maximum number of requests allowed in the window. */
  limit: number;
  /** The number of requests remaining in the current window. */
  remaining: number;
  /** The time (Unix timestamp in seconds) when the current window resets. */
  reset: number;
}

/**
 * Utility to handle rate limiting logic using Cloudflare KV.
 * Implements a Fixed Window algorithm.
 *
 * @param kv - The Cloudflare KV namespace to use for storage.
 * @param key - The unique identifier for the client (e.g., IP or User ID).
 * @param limit - Max requests allowed per window.
 * @param window - Window duration in seconds.
 * @returns Promise<RateLimitResult>
 */
export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  window: number,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / window) * window;
  const resetTime = windowStart + window;
  const cacheKey = `rate-limit:${key}:${windowStart}`;

  // 1. Get current count
  const currentCountStr = await kv.get(cacheKey);
  const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

  // 2. If limit reached, return failure immediately (no write)
  if (currentCount >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTime,
    };
  }

  // 3. Increment and save (Atomic increment not available in KV, but acceptable for this use case)
  const newCount = currentCount + 1;

  // Set TTL to window length plus some buffer to ensure it's available for the full window
  await kv.put(cacheKey, newCount.toString(), {
    expirationTtl: Math.max(60, window + 60),
  });

  return {
    success: true,
    limit,
    remaining: limit - newCount,
    reset: resetTime,
  };
}
