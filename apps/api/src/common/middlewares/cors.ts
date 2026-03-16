import { cors } from "hono/cors";
import type { Context } from "hono";
import type { AppContext } from "../types/env";

/**
 * Robust CORS configuration.
 * Restricts access to the defined PUBLIC_APP_URL in production.
 * Allows all origins in development for better DX.
 */
export const corsMiddleware = () => {
  return cors({
    origin: (origin, c: Context<AppContext>) => {
      const allowed = c.env.PUBLIC_APP_URL;

      // In development/test, we are more permissive
      if (c.env.NODE_ENV !== "production") {
        return origin;
      }

      // In production, strictly enforce the app URL
      return origin === allowed ? origin : allowed;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-workspace-id",
      "x-cache-bust",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
};
