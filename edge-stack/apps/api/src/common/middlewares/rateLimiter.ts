import type { Context, Next } from "hono";
import { AppError } from "@workspace/types";
import type { AppContext } from "../types/env";
import { checkRateLimit } from "../utils/rate-limiter";
import { TIER_CONFIG, type SubscriptionTier } from "../constants/subscriptions";

/**
 * Options for the rate limiter middleware.
 */
export interface RateLimitOptions {
  /** Time window in seconds. Default: 60. */
  window?: number;
  /** Max requests in the window. Default: 100. */
  limit?: number;
  /** Custom prefix for the KV key to isolate different types of limits. */
  keyPrefix?: string;
  /** Optional mapping of plan IDs to specific rate limits. */
  tierLimits?: Record<string, number>;
}

/**
 * Middleware factory to enforce rate limiting using Cloudflare KV.
 * Supports limiting by User ID (if authenticated) or IP address.
 * Dynamically adjusts limits based on the current workspacePlan.
 *
 * @param options - Configuration for window and request limit.
 */
export const rateLimit = (options: RateLimitOptions = {}) => {
  const {
    window = 60,
    limit: defaultLimit = 100,
    keyPrefix = "rl",
    tierLimits,
  } = options;

  return async (c: Context<AppContext>, next: Next): Promise<void> => {
    // 1. Identify Client (Workspace > User > IP)
    const workspaceId = c.get("workspaceId");
    const userId = c.get("userId");
    const workspacePlan = c.get("workspacePlan") as SubscriptionTier | undefined;
    const clientIp = c.get("clientIp") || "127.0.0.1";

    // Deterministic limit based on plan or tiers
    let limit = defaultLimit;

    if (workspacePlan) {
      if (tierLimits?.[workspacePlan]) {
        limit = tierLimits[workspacePlan];
      } else if (TIER_CONFIG[workspacePlan]) {
        limit = TIER_CONFIG[workspacePlan].rateLimit;
      }
    }

    // Use workspaceId if available to enforce tenant-wide limits,
    // otherwise fallback to authenticated user, then guest IP.
    const identifier = workspaceId
      ? `w:${workspaceId}`
      : userId
        ? `u:${userId}`
        : `i:${clientIp}`;

    const key = `${keyPrefix}:${identifier}`;

    // Support for local development or missing bindings
    if (!c.env.RATE_LIMIT_KV) {
      console.warn(
        "[RateLimiter] RATE_LIMIT_KV binding is missing. Skipping validation.",
      );
      return await next();
    }

    // 2. Orchestrate KV logic via utility
    const result = await checkRateLimit(
      c.env.RATE_LIMIT_KV,
      key,
      limit,
      window,
    );

    // 3. Populate standard headers
    c.header("X-RateLimit-Limit", result.limit.toString());
    c.header("X-RateLimit-Remaining", result.remaining.toString());
    c.header("X-RateLimit-Reset", result.reset.toString());

    // 4. Handle 429 Too Many Requests
    if (!result.success) {
      const retryAfter = Math.max(
        0,
        result.reset - Math.floor(Date.now() / 1000),
      );
      c.header("Retry-After", retryAfter.toString());

      throw new AppError(
        "Too many requests. Please try again later.",
        429,
        "RATE_LIMIT_EXCEEDED",
      );
    }

    return await next();
  };
};

/**
 * Legacy export for backward compatibility during refactoring.
 * @deprecated Use rateLimit() instead.
 */
export const createRateLimiter = () => rateLimit();
