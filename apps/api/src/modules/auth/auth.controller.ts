import type { Context } from "hono";
import { successResponse } from "../../common/responses";
import {
  createAuthService,
  create2faService,
  OAuthService,
} from "@workspace/services";
import { createQueueService } from "../../common/services/queue.service";
import { createJwtService } from "../../common/services/jwt.service";
import { createDbClient } from "@workspace/db";
import { createAnalyticsService } from "../../common/services/analytics.service";
import { AuditService } from "../../common/services/audit.service";
import type { AppContext } from "../../common/types/env";

/**
 * Controller for orchestrating authentication and identity workflows.
 * Handles user registration, multi-factor authentication, and OAuth 2.0 social logins.
 *
 * @returns An object containing all authentication route handlers.
 */
export const createAuthController = () => {
  return {
    /**
     * Orchestrates the registration of a new user.
     * Creates the user in the database, sends a welcome email via queue, and tracks analytics.
     *
     * @param c - Hono application context
     */
    register: async (c: Context<AppContext>) => {
      const data = await c.req.json();
      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();

      const service = createAuthService(db, queue, jwt, tfa);
      const result = await service.register(data);

      const analytics = createAnalyticsService(c.env);
      c.executionCtx.waitUntil(
        analytics.trackRegistration(result.user!.id, result.user!.email),
      );

      c.executionCtx.waitUntil(
        AuditService.trackAction(c, {
          action: "user.register",
          entityType: "user",
          entityId: result.user!.id,
          metadata: { email: result.user!.email },
        }),
      );

      return c.json(successResponse(result), 201);
    },

    /**
     * Validates user credentials and initiates a session.
     * If 2FA is enabled, returns a pending state instead of full authentication tokens.
     *
     * @param c - Hono application context
     */
    login: async (c: Context<AppContext>) => {
      const data = await c.req.json();
      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();

      const service = createAuthService(db, queue, jwt, tfa);
      const result = await service.login(data);

      if (result.user) {
        const analytics = createAnalyticsService(c.env);
        c.executionCtx.waitUntil(
          analytics.trackLogin(result.user.id, result.user.email),
        );

        c.executionCtx.waitUntil(
          AuditService.trackAction(c, {
            action: "user.login",
            entityType: "user",
            entityId: result.user.id,
          }),
        );
      }

      return c.json(successResponse(result), 200);
    },

    /**
     * Issues a new set of access and refresh tokens using a valid refresh token.
     *
     * @param c - Hono application context
     */
    refresh: async (c: Context<AppContext>) => {
      const { refreshToken } = await c.req.json();
      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();

      const service = createAuthService(db, queue, jwt, tfa);
      const result = await service.refresh(refreshToken);

      return c.json(successResponse(result), 200);
    },

    /**
     * Redirects the user to the social provider's consent page.
     * Supports Google, Facebook, and GitHub.
     *
     * @param c - Hono application context
     */
    socialLogin: async (c: Context<AppContext>) => {
      const provider = c.req.param("provider");
      const oauth = new OAuthService({
        googleClientId: c.env.GOOGLE_CLIENT_ID,
        googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
        facebookAppId: c.env.FACEBOOK_APP_ID,
        facebookAppSecret: c.env.FACEBOOK_APP_SECRET,
        githubClientId: c.env.GITHUB_CLIENT_ID,
        githubClientSecret: c.env.GITHUB_CLIENT_SECRET,
      });

      const state = crypto.randomUUID();
      const redirectUri = `${new URL(c.req.url).origin}/api/auth/callback/${provider}`;

      let url = "";
      if (provider === "google")
        url = oauth.getGoogleAuthUrl(state, redirectUri);
      else if (provider === "facebook")
        url = oauth.getFacebookAuthUrl(state, redirectUri);
      else if (provider === "github")
        url = oauth.getGithubAuthUrl(state, redirectUri);
      else
        return c.json(
          {
            success: false as const,
            error: {
              code: "INVALID_PROVIDER",
              message: "Unsupported provider",
            },
          },
          400,
        );

      return c.redirect(url);
    },

    /**
     * Internal callback for OAuth 2.0 flow completion.
     * Authenticates the user based on the provider's code and finalizes the session.
     *
     * @param c - Hono application context
     */
    socialCallback: async (c: Context<AppContext>) => {
      const provider = c.req.param("provider");
      const code = c.req.query("code");
      const originUrl = new URL(c.req.url);
      const redirectUri = `${originUrl.origin}/api/auth/callback/${provider}`;

      if (!code)
        return c.json(
          {
            success: false as const,
            error: { code: "BAD_REQUEST", message: "Missing code" },
          },
          400,
        );

      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();
      const authService = createAuthService(db, queue, jwt, tfa);
      const oauth = new OAuthService({
        googleClientId: c.env.GOOGLE_CLIENT_ID,
        googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
        facebookAppId: c.env.FACEBOOK_APP_ID,
        facebookAppSecret: c.env.FACEBOOK_APP_SECRET,
        githubClientId: c.env.GITHUB_CLIENT_ID,
        githubClientSecret: c.env.GITHUB_CLIENT_SECRET,
      });

      try {
        let profile;
        if (provider === "google")
          profile = await oauth.verifyGoogleCode(code, redirectUri);
        else if (provider === "facebook")
          profile = await oauth.verifyFacebookCode(code, redirectUri);
        else if (provider === "github")
          profile = await oauth.verifyGithubCode(code, redirectUri);
        else
          return c.json(
            {
              success: false as const,
              error: {
                code: "INVALID_PROVIDER",
                message: "Unsupported provider",
              },
            },
            400,
          );

        const stateRaw = c.req.query("state");
        let manualLinkToken = null;
        if (stateRaw) {
          try {
            const parsed = JSON.parse(atob(stateRaw));
            if (parsed.token) manualLinkToken = parsed.token;
          } catch (e) {}
        }

        let authenticatedUserId = undefined;
        if (manualLinkToken) {
          const payload = await jwt.verifyToken(manualLinkToken);
          authenticatedUserId = payload.sub as string;
        }

        const result = await authService.socialLogin(
          provider,
          profile,
          authenticatedUserId,
        );

        // Handle dev environment port mapping (Wrangler -> Astro)
        const frontendBase = originUrl.origin.replace("8787", "4321");

        if (authenticatedUserId) {
          return c.redirect(
            `${frontendBase}/dashboard/settings/security?linked=true`,
          );
        }

        if (result.pending2fa) {
          return c.redirect(
            `${frontendBase}/2fa-challenge?token=${result.token}`,
          );
        }

        return c.redirect(`${frontendBase}/dashboard?token=${result.token}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Authentication failed";
        return c.json(
          { success: false as const, error: { code: "OAUTH_ERROR", message } },
          400,
        );
      }
    },

    /**
     * Generates an authentication URL for linking an external provider to an existing account.
     *
     * @param c - Hono application context
     */
    linkProvider: async (c: Context<AppContext>) => {
      const provider = c.req.param("provider");
      const token = c.req.query("token");

      if (!token) {
        return c.json(
          {
            success: false as const,
            error: {
              code: "UNAUTHORIZED",
              message: "Token required for manual linking.",
            },
          },
          401,
        );
      }

      const oauth = new OAuthService({
        googleClientId: c.env.GOOGLE_CLIENT_ID,
        googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
        facebookAppId: c.env.FACEBOOK_APP_ID,
        facebookAppSecret: c.env.FACEBOOK_APP_SECRET,
        githubClientId: c.env.GITHUB_CLIENT_ID,
        githubClientSecret: c.env.GITHUB_CLIENT_SECRET,
      });
      const statePayload = { token, rand: crypto.randomUUID() };
      const state = btoa(JSON.stringify(statePayload));
      const redirectUri = `${new URL(c.req.url).origin}/api/auth/callback/${provider}`;

      let url = "";
      if (provider === "google")
        url = oauth.getGoogleAuthUrl(state, redirectUri);
      else if (provider === "facebook")
        url = oauth.getFacebookAuthUrl(state, redirectUri);
      else if (provider === "github")
        url = oauth.getGithubAuthUrl(state, redirectUri);
      else
        return c.json(
          {
            success: false as const,
            error: {
              code: "INVALID_PROVIDER",
              message: "Unsupported provider",
            },
          },
          400,
        );

      return c.redirect(url);
    },

    /**
     * Removes a linked social provider from the user's account.
     *
     * @param c - Hono application context
     */
    unlinkProvider: async (c: Context<AppContext>) => {
      const provider = c.req.param("provider");
      const userId = c.get("userId");

      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();
      const authService = createAuthService(db, queue, jwt, tfa);

      await authService.unlinkAccount(userId, provider);
      return c.json(successResponse(null), 200);
    },

    /**
     * Generates a new 2FA secret and QR code for the user to set up their authenticator.
     *
     * @param c - Hono application context
     */
    setup2fa: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();
      const authService = createAuthService(db, queue, jwt, tfa);

      const result = await authService.setup2fa(userId);
      return c.json(successResponse(result), 200);
    },

    /**
     * Finalizes 2FA setup by verifying a token from the user's authenticator app.
     *
     * @param c - Hono application context
     */
    enable2fa: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const { token } = await c.req.json();
      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();
      const authService = createAuthService(db, queue, jwt, tfa);

      const result = await authService.enable2fa(userId, token);
      return c.json(successResponse(result), 200);
    },

    /**
     * Verifies a 2FA token during the login flow.
     *
     * @param c - Hono application context
     */
    verify2fa: async (c: Context<AppContext>) => {
      const { token, recoveryCode } = await c.req.json();
      const authHeader = c.req.header("Authorization");
      if (!authHeader)
        return c.json(
          {
            success: false as const,
            error: { code: "UNAUTHORIZED", message: "Authorization required" },
          },
          401,
        );

      const pendingToken = authHeader.split(" ")[1];
      const jwt = createJwtService(c.env.JWT_SECRET);

      let payload;
      try {
        payload = await jwt.verifyToken(pendingToken);
      } catch {
        return c.json(
          {
            success: false as const,
            error: {
              code: "UNAUTHORIZED",
              message: "Invalid or expired pending token",
            },
          },
          401,
        );
      }

      if (!payload.pending2fa || !payload.sub) {
        return c.json(
          {
            success: false as const,
            error: {
              code: "INVALID_TOKEN",
              message: "Invalid token type for 2FA verification",
            },
          },
          400,
        );
      }

      const userId = payload.sub as string;
      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const tfa = create2faService();
      const authService = createAuthService(db, queue, jwt, tfa);

      const result = await authService.verify2fa(userId, token, recoveryCode);
      return c.json(successResponse(result), 200);
    },

    /**
     * Orchestrates the password recovery request.
     */
    requestRecovery: async (c: Context<AppContext>) => {
      const { email } = await c.req.json();
      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();
      const authService = createAuthService(db, queue, jwt, tfa);

      await authService.requestPasswordReset(email);
      return c.json(successResponse({ success: true } as const), 200);
    },

    /**
     * Orchestrates the password reset execution.
     */
    resetPassword: async (c: Context<AppContext>) => {
      const { token, password } = await c.req.json();
      const db = createDbClient(c.env.DATABASE_URL);
      const queue = createQueueService(c.env.JOBS_QUEUE);
      const jwt = createJwtService(c.env.JWT_SECRET);
      const tfa = create2faService();
      const authService = createAuthService(db, queue, jwt, tfa);

      await authService.resetPassword(token, password);
      return c.json(successResponse({ success: true } as const), 200);
    },
  };
};
