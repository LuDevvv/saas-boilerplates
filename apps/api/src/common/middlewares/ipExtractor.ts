import type { Context, Next } from "hono";
import type { AppContext } from "../types/env";

/**
 * Middleware to extract the client's IP address from Request headers.
 * Prioritizes Cloudflare's 'CF-Connecting-IP' header.
 */
export const ipExtractor = async (
  c: Context<AppContext>,
  next: Next,
): Promise<void> => {
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";

  c.set("clientIp", ip);

  return await next();
};
