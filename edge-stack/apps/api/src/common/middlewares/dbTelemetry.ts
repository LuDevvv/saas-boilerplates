import type { MiddlewareHandler } from "hono";
import type { AppContext } from "../types/env";

/**
 * Database Telemetry Middleware.
 * Wraps database operations with performance timing and logs metrics.
 * Must be applied AFTER the injectServices middleware.
 */
export const dbTelemetry = (): MiddlewareHandler<AppContext> => {
  return async (c, next) => {
    const originalServices = c.get("services");
    if (!originalServices?.db) {
      await next();
      return;
    }

    const db = originalServices.db;

    const proxyDb = new Proxy(db, {
      get(target, prop) {
        if (prop === "query" || prop === "select" || prop === "insert" || prop === "update" || prop === "delete") {
          return new Proxy(target[prop as keyof typeof target], {
            apply(methodTarget, thisArg, args) {
              const queryType = prop as string;
              const startTime = performance.now();

              try {
                const result = Reflect.apply(methodTarget, thisArg, args) as Promise<unknown>;

                if (result && typeof result.then === "function") {
                  return result.then(async (queryResult: unknown) => {
                    const duration = Math.round((performance.now() - startTime) * 100) / 100;

                    console.log("[DB Telemetry]", {
                      category: "db.query",
                      queryType,
                      durationMs: duration,
                      schema: "neon-http",
                      level: duration > 500 ? "warning" : "info",
                    });

                    return queryResult;
                  });
                }

                return result;
              } catch (error) {
                const duration = Math.round((performance.now() - startTime) * 100) / 100;
                console.error(`[DB Telemetry] Query failed after ${duration}ms:`, error);
                throw error;
              }
            },
          });
        }
        return target[prop as keyof typeof target];
      },
    });

    c.set("services", {
      ...originalServices,
      db: proxyDb,
    });

    await next();
  };
};
