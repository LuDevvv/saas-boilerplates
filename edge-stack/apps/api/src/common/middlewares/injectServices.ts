import type { MiddlewareHandler } from "hono";
import type { AppContext } from "../types/env";
import { createDbClient } from "@workspace/db";
import { createCacheService } from "../services/cache.service";
import { createQueueService } from "../services/queue.service";
import { createEmailService } from "../services/email.service";
import {
  createAuthService,
  createWorkspaceService,
  createBillingService,
  create2faService,
} from "@workspace/services";
import { createJwtService } from "../services/jwt.service";
import { createAnalyticsService } from "../services/analytics.service";
import { createAuditService } from "../services/audit.service";

/**
 * Middleware to inject service instances into the Hono context.
 * Enables Dependency Injection and keeps controllers clean.
 */
export const injectServices = (): MiddlewareHandler<AppContext> => {
  return async (c, next) => {
    const db = createDbClient(c.env.DATABASE_URL);
    const cache = createCacheService(c.env.CACHE_KV);
    const queue = createQueueService(c.env.JOBS_QUEUE);
    const email = createEmailService(c.env.EMAIL_QUEUE);
    const jwt = createJwtService(c.env.JWT_SECRET);
    const tfa = create2faService();
    const analytics = createAnalyticsService(c.env);

    // Instantiate domain services
    const auth = createAuthService(db, queue, jwt, tfa, {
      googleClientId: c.env.GOOGLE_CLIENT_ID,
      googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
      facebookAppId: c.env.FACEBOOK_APP_ID,
      facebookAppSecret: c.env.FACEBOOK_APP_SECRET,
      githubClientId: c.env.GITHUB_CLIENT_ID,
      githubClientSecret: c.env.GITHUB_CLIENT_SECRET,
    });
    const workspaces = createWorkspaceService(db, cache);
    const billing = createBillingService(db, c.env.ENCRYPTION_KEY);
    const audit = createAuditService(queue);

    c.set("services", {
      db,
      cache,
      queue,
      email,
      auth,
      workspaces,
      billing,
      analytics,
      audit,
    });

    await next();
  };
};
