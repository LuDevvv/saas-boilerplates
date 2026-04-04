import { AppError } from "@workspace/types";
import type { Context, Next, MiddlewareHandler } from "hono";
import type { AppContext } from "../types/env";
import { getCookie, setCookie } from "hono/cookie";
import { generateRandomString } from "@workspace/services";

/**
 * Middleware for CSRF protection using the 'Double Submit Cookie' pattern.
 * Required for stateful operations or when extra security is needed beyond Origin checks.
 *
 * Flow:
 * 1. GET requests: If no CSRF cookie exists, one is generated and set.
 * 2. Mutation requests (POST, PUT, DELETE): Validates that the 'X-CSRF-Token'
 *    header matches the 'csrf_token' cookie.
 */
export const csrfTokenGuard = (): MiddlewareHandler<AppContext> => {
  return async (c: Context<AppContext>, next: Next): Promise<void> => {
    const method = c.req.method;
    const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

    // 1. Get existing token from cookie
    let cookieToken = getCookie(c, "csrf_token");

    // 2. If it doesn't exist, generate a new one (typically on GET)
    if (!cookieToken) {
      cookieToken = generateRandomString(16);
      setCookie(c, "csrf_token", cookieToken, {
        path: "/",
        httpOnly: false, // Must be readable by client to send in header
        secure: true,
        sameSite: "Lax",
        maxAge: 3600 * 24, // 1 day
      });
    }

    // 3. For mutation requests, perform validation
    if (isMutation) {
      // Allow bypass in development for easier API testing (e.g. Postman)
      if (c.env.NODE_ENV === "development") {
        return await next();
      }

      const headerToken = c.req.header("X-CSRF-Token");

      if (!headerToken || headerToken !== cookieToken) {
        throw new AppError(
          "CSRF validation failed: Token mismatch or missing.",
          403,
          "FORBIDDEN_CSRF",
        );
      }
    }

    await next();
  };
};
