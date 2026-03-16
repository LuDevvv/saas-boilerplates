import { verify } from "hono/jwt";
import { AppError } from "@workspace/types";
import type { Context, Next } from "hono";
import type { AppContext } from "../types/env";
import { createCacheService, CACHE_KEYS } from "../services/cache.service";
import { createDbClient, UserRepository } from "@workspace/db";

/**
 * Middleware to protect routes via JWT Bearer tokens.
 * Extracts the token, verifies it against the secret, and injects identity into the context.
 * Implements Edge Caching for user profile sessions to minimize database roundtrips.
 *
 * @throws {AppError} 401 if token is missing, invalid, or expired.
 */
export const authGuard = async (
  c: Context<AppContext>,
  next: Next,
): Promise<void> => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(
      "Authorization header missing or invalid format.",
      401,
      "MISSING_TOKEN",
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new AppError(
      "Authentication token not provided.",
      401,
      "MISSING_TOKEN",
    );
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");

    if (!payload.sub) {
      throw new AppError(
        "Invalid token payload: missing sub claim.",
        401,
        "INVALID_TOKEN",
      );
    }

    if (payload.pending2fa) {
      throw new AppError(
        "2FA required to access this resource.",
        403,
        "2FA_REQUIRED",
      );
    }

    const userId = payload.sub as string;
    const cache = createCacheService(c.env.CACHE_KV);
    const cacheKey = CACHE_KEYS.userSession(userId);

    // 1. Try to retrieve user profile from Edge Cache
    let user = await cache.get<{
      id: string;
      email: string;
      role: string;
      name: string;
      avatarUrl: string;
    }>(cacheKey);

    if (!user) {
      // 2. Cache Miss: Fetch from DB and populate cache
      const db = createDbClient(c.env.DATABASE_URL);
      const dbUser = await UserRepository.findById(db, userId);

      if (!dbUser) {
        throw new AppError(
          "Authenticated user no longer exists.",
          401,
          "INVALID_TOKEN",
        );
      }

      user = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        name: dbUser.name || "User",
        avatarUrl: dbUser.avatarUrl || "",
      };

      // Populate KV for 1 hour
      await cache.set(cacheKey, user, 3600);
    }

    // Set identity in context for downstream handlers/controllers
    c.set("userId", userId);
    c.set("user", user);

    return await next();
  } catch (error) {
    if (error instanceof AppError) throw error;

    const isExpired =
      error instanceof Error && error.message.toLowerCase().includes("expired");
    const code = isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
    const msg = isExpired
      ? "Authentication token has expired."
      : "Invalid or expired authentication token.";

    throw new AppError(msg, 401, code);
  }
};
