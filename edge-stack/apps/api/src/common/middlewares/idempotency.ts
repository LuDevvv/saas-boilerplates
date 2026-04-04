import type { Context, Next } from "hono";
import type { AppContext } from "../types/env";
import { createCacheService, CACHE_KEYS } from "../services/cache.service";

/**
 * Middleware to handle Idempotency-Key headers for mutation requests.
 * Ensures that retried requests with the same key return the same response
 * without re-executing logic, preventing duplicate mutations (e.g. billing, creation).
 * 
 * Logic Highlights:
 * 1. Prevents duplicate execution.
 * 2. Handles concurrent requests for the same key (Locking).
 * 3. Caches successful and client-error responses (status < 500).
 */
export const idempotencyGuard = async (
  c: Context<AppContext>,
  next: Next,
): Promise<void | Response> => {
  const method = c.req.method;
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const idempotencyKey = c.req.header("Idempotency-Key");

  // Skip if not a mutation or no key provided
  if (!isMutation || !idempotencyKey) {
    return await next();
  }

  const cache = createCacheService(c.env.CACHE_KV);
  const cacheKey = CACHE_KEYS.idempotency(idempotencyKey);

  // 1. Check for cached response or in-progress state
  const cached = await cache.get<{
    status: number;
    headers: Record<string, string>;
    body: any;
    inProgress?: boolean;
  }>(cacheKey);

  if (cached) {
    if (cached.inProgress) {
      return c.json(
        { 
          success: false, 
          error: { message: "Request with this idempotency key is already in progress" } 
        }, 
        409, // Conflict
        { "Retry-After": "5" }
      );
    }

    return c.json(cached.body, cached.status as any, {
      ...cached.headers,
      "X-Idempotency-Cache": "HIT",
    });
  }

  // 2. Set "In Progress" lock to prevent concurrent executions
  // KV min TTL is 60s, which is enough for most edge operations
  await cache.set(cacheKey, { inProgress: true }, 60);

  try {
    // 3. Execute the request
    await next();

    // 4. Persist result if it's a valid completion (status < 500)
    if (c.res && c.res.status < 500) {
      const responseClone = c.res.clone();
      
      const contentType = responseClone.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const body = await responseClone.json();
        
        const responseToCache = {
          status: c.res.status,
          headers: {
            "Content-Type": "application/json",
          },
          body,
          inProgress: false,
        };

        // Cache for 24 hours
        await cache.set(cacheKey, responseToCache, 86400);
        c.res.headers.set("X-Idempotency-Cache", "MISS");
      } else {
        // Not JSON, just clear the lock so it can be retried if needed
        await cache.delete(cacheKey);
      }
    } else {
      // Server error or no response, clear the lock so it can be retried
      await cache.delete(cacheKey);
    }
  } catch (error) {
    // Execution failed, clear the lock
    await cache.delete(cacheKey);
    throw error;
  }
};
