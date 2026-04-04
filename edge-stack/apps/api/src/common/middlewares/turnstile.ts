import type { Context, Next } from "hono";
import { AppError } from "@workspace/types";
import type { AppContext } from "../types/env";

/**
 * Interface for Turnstile verification response.
 */
interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  challenge_ts?: string;
  action?: string;
  cdata?: string;
}

/**
 * Middleware to validate Cloudflare Turnstile tokens.
 * Extracts token from 'x-turnstile-token' header or JSON body 'cf-turnstile-response'.
 * Throws AppError if validation fails.
 */
export const validateTurnstile = () => {
  return async (c: Context<AppContext>, next: Next): Promise<void> => {
    let token = c.req.header("x-turnstile-token");

    if (!token) {
      try {
        const body = (await c.req.raw.clone().json()) as Record<
          string,
          unknown
        >;
        token = body["cf-turnstile-response"] as string | undefined;
      } catch {
        // Ignore missing or invalid JSON body
      }
    }

    if (!token) {
      // Allow bypass in development for easier API testing
      if (c.env.NODE_ENV === "development") {
        return await next();
      }
      throw new AppError(
        "Anti-bot validation failed",
        403,
        "TURNSTILE_REQUIRED",
      );
    }

    // Allow bypass in development with a dummy token
    if (
      c.env.NODE_ENV === "development" &&
      (token === "XXXX.DUMMY.TOKEN.XXXX" || token === "dummy")
    ) {
      return await next();
    }

    const formData = new URLSearchParams();
    formData.append("secret", c.env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);

    const clientIp = c.get("clientIp");
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const outcome = (await res.json()) as TurnstileVerifyResponse;

    if (!outcome.success) {
      throw new AppError(
        "Anti-bot validation failed",
        403,
        "TURNSTILE_FAILED",
        outcome["error-codes"],
      );
    }

    return await next();
  };
};
