import type { MiddlewareHandler } from "hono";
import type { AppContext } from "../types/env";

/**
 * Chaos Triggers supported by the middleware.
 */
export type ChaosTrigger = 
  | "db_down" 
  | "cache_down" 
  | "queue_down" 
  | "latency_high" 
  | "system_crash";

/**
 * Middleware for Chaos Engineering.
 * Simulates dependency failures based on the 'X-Chaos-Trigger' header.
 * Use ONLY in non-production environments or with strict authorization.
 */
export const chaosMiddleware = (): MiddlewareHandler<AppContext> => {
  return async (c, next) => {
    const trigger = c.req.header("X-Chaos-Trigger") as ChaosTrigger | undefined;

    if (!trigger || c.env.NODE_ENV === "production") {
      return await next();
    }

    console.warn(`[Chaos] Triggering failure: ${trigger}`);

    // 1. System-wide crash simulation
    if (trigger === "system_crash") {
      throw new Error("Chaos: Simulated system-wide crash");
    }

    // 2. High Latency simulation (3s delay)
    if (trigger === "latency_high") {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // 3. Service Failure Injection (Modify injected services before controllers run)
    // Note: This assumes injectServices has already run.
    const services = c.get("services");
    if (services) {
      if (trigger === "db_down") {
        c.set("services", {
          ...services,
          db: new Proxy(services.db, {
            get() {
              throw new Error("Chaos: Database is currently unavailable (simulated)");
            },
          }),
        });
      }

      if (trigger === "cache_down") {
        c.set("services", {
          ...services,
          cache: new Proxy(services.cache, {
            get() {
              throw new Error("Chaos: KV Cache is currently offline (simulated)");
            },
          }),
        });
      }

      if (trigger === "queue_down") {
        c.set("services", {
          ...services,
          queue: new Proxy(services.queue, {
            get() {
              throw new Error("Chaos: Message Queue is congested/down (simulated)");
            },
          }),
        });
      }
    }

    await next();
  };
};
