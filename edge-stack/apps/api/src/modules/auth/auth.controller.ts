import type { Context } from "hono";
import { successResponse } from "../../common/responses";
import { OAuthService } from "@workspace/services";
import type { AppContext } from "../../common/types/env";

/**
 * Controller for orchestrating authentication and identity workflows.
 * Handles user registration, multi-factor authentication, and OAuth 2.0 social logins.
 * Now uses Dependency Injection via Hono context for clean orchestration.
 *
 * @returns An object containing all authentication route handlers.
 */
export const createAuthController = () => {
  return {
    /**
     * Orchestrates the registration of a new user.
     */
    register: async (c: Context<AppContext>) => {
      const data = await c.req.json();
      const { auth, analytics, audit } = c.get("services");

      const result = await auth.register(data);

      c.executionCtx.waitUntil(
        analytics.trackRegistration(result.user!.id, result.user!.email),
      );

      c.executionCtx.waitUntil(
        audit.trackActionFromContext(c, {
          action: "user.register",
          entityType: "user",
          entityId: result.user!.id,
          actorId: result.user!.id,
          metadata: { email: result.user!.email },
        }),
      );

      return c.json(successResponse(result), 201);
    },

    /**
     * Validates user credentials and initiates a session.
     */
    login: async (c: Context<AppContext>) => {
      const data = await c.req.json();
      const { auth, analytics, audit } = c.get("services");

      const result = await auth.login(data);

      if (result.user) {
        c.executionCtx.waitUntil(
          analytics.trackLogin(result.user.id, result.user.email),
        );

        c.executionCtx.waitUntil(
          audit.trackActionFromContext(c, {
            action: "user.login",
            entityType: "user",
            entityId: result.user.id,
            actorId: result.user.id,
          }),
        );
      }

      return c.json(successResponse(result), 200);
    },

    /**
     * Issues a new set of access and refresh tokens.
     */
    refresh: async (c: Context<AppContext>) => {
      const { refreshToken } = await c.req.json();
      const { auth } = c.get("services");
      const result = await auth.refresh(refreshToken);
      return c.json(successResponse(result), 200);
    },

    /**
     * Terminates the current session by invalidating the refresh token.
     */
    logout: async (c: Context<AppContext>) => {
      const { refreshToken } = await c.req.json();
      const { auth } = c.get("services");
      await auth.logout(refreshToken);
      return c.json(successResponse({ success: true }), 200);
    },

    /**
     * Completes a 2FA challenge.
     */
    verify2fa: async (c: Context<AppContext>) => {
      const { code, pendingToken } = await c.req.json();
      const { auth } = c.get("services");
      const result = await auth.verify2fa(pendingToken, code);
      return c.json(successResponse(result), 200);
    },

    /**
     * Generates a 2FA setup QR code.
     */
    setup2fa: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const { auth } = c.get("services");
      const result = await auth.setup2fa(userId);
      return c.json(successResponse(result), 200);
    },

    /**
     * Toggles 2FA for the user.
     */
    toggle2fa: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const { enabled } = await c.req.json();
      const { auth } = c.get("services");
      await auth.toggle2fa(userId, enabled);
      return c.json(successResponse({ enabled }), 200);
    },

    /**
     * Enables 2FA for the user after verification.
     */
    enable2fa: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const { code } = await c.req.json();
      const { auth } = c.get("services");
      const result = await auth.enable2fa(userId, code);
      return c.json(successResponse(result), 200);
    },

    /**
     * Initiates password recovery.
     */
    requestRecovery: async (c: Context<AppContext>) => {
      const { email } = await c.req.json();
      const { auth } = c.get("services");
      await auth.requestPasswordReset(email);
      return c.json(successResponse({ success: true }), 200);
    },

    /**
     * Resets password using a token.
     */
    resetPassword: async (c: Context<AppContext>) => {
      const { token, password } = await c.req.json();
      const { auth } = c.get("services");
      await auth.resetPassword(token, password);
      return c.json(successResponse({ success: true }), 200);
    },

    /**
     * Initiates OAuth flow.
     */
    socialLogin: async (c: Context<AppContext>) => {
      const provider = c.req.param("provider") as any;
      const oauth = new OAuthService({
        googleClientId: c.env.GOOGLE_CLIENT_ID,
        googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
        facebookAppId: c.env.FACEBOOK_APP_ID,
        facebookAppSecret: c.env.FACEBOOK_APP_SECRET,
        githubClientId: c.env.GITHUB_CLIENT_ID,
        githubClientSecret: c.env.GITHUB_CLIENT_SECRET,
      });

      const state = "static_for_now";
      const redirectUri = `${c.env.PUBLIC_APP_URL}/api/v1/auth/callback/${provider}`;

      let url = "";
      if (provider === "google")
        url = oauth.getGoogleAuthUrl(state, redirectUri);
      if (provider === "facebook")
        url = oauth.getFacebookAuthUrl(state, redirectUri);
      if (provider === "github")
        url = oauth.getGithubAuthUrl(state, redirectUri);

      return c.redirect(url);
    },

    /**
     * Handles OAuth callback.
     */
    oauthCallback: async (c: Context<AppContext>) => {
      const provider = c.req.param("provider") as any;
      const code = c.req.query("code");
      const { auth, db } = c.get("services");

      if (!code) throw new Error("Missing OAuth code");

      const oauth = new OAuthService({
        googleClientId: c.env.GOOGLE_CLIENT_ID,
        googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
        facebookAppId: c.env.FACEBOOK_APP_ID,
        facebookAppSecret: c.env.FACEBOOK_APP_SECRET,
        githubClientId: c.env.GITHUB_CLIENT_ID,
        githubClientSecret: c.env.GITHUB_CLIENT_SECRET,
      });

      const redirectUri = `${c.env.PUBLIC_APP_URL}/api/v1/auth/callback/${provider}`;
      const profile = await oauth.getUserProfile(provider, code, redirectUri);
      const result = await auth.loginWithOAuth(provider, profile);

      return c.json(successResponse(result), 200);
    },

    /**
     * Links an OAuth provider to an existing account.
     */
    linkProvider: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const provider = c.req.param("provider") as any;
      const oauth = new OAuthService({
        googleClientId: c.env.GOOGLE_CLIENT_ID,
        googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
        facebookAppId: c.env.FACEBOOK_APP_ID,
        facebookAppSecret: c.env.FACEBOOK_APP_SECRET,
        githubClientId: c.env.GITHUB_CLIENT_ID,
        githubClientSecret: c.env.GITHUB_CLIENT_SECRET,
      });

      const state = "link_account";
      const redirectUri = `${c.env.PUBLIC_APP_URL}/api/v1/auth/callback/${provider}?link=true`;
      
      let url = "";
      if (provider === "google") url = oauth.getGoogleAuthUrl(state, redirectUri);
      if (provider === "facebook") url = oauth.getFacebookAuthUrl(state, redirectUri);
      if (provider === "github") url = oauth.getGithubAuthUrl(state, redirectUri);
      
      return c.redirect(url);
    },

    /**
     * Unlinks an OAuth provider.
     */
    unlinkProvider: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const provider = c.req.param("provider") as any;
      const { auth } = c.get("services");
      await auth.unlinkProvider(userId, provider);
      return c.json(successResponse({ success: true }), 200);
    },

    /**
     * Get current user profile.
     */
    me: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const { auth } = c.get("services");
      const result = await auth.getMe(userId);
      return c.json(successResponse({ user: result }), 200);
    },

    /**
     * Get active sessions.
     */
    getSessions: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const { auth } = c.get("services");
      // Current session ID matching omitted in edge stack due to refresh token differences
      const result = await auth.getSessions(userId, "");
      return c.json(successResponse({ sessions: result }), 200);
    },

    /**
     * Revoke a specific session.
     */
    revokeSession: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const sessionId = c.req.param("id");
      const { auth } = c.get("services");
      await auth.revokeSession(userId, sessionId, "");
      return c.json(successResponse({ success: true }), 200);
    },

    /**
     * Revoke all other sessions.
     */
    revokeAllSessions: async (c: Context<AppContext>) => {
      const userId = c.get("userId");
      const { auth } = c.get("services");
      await auth.revokeAllOtherSessions(userId, "");
      return c.json(successResponse({ success: true }), 200);
    },
  };
};
