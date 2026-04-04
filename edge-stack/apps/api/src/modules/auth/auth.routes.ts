import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import {
  RegisterSchema,
  LoginSchema,
  AuthSuccessSchema,
  ErrorSchema,
  TwoFactorEnableSchema,
  TwoFactorVerifySchema,
  RefreshSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@workspace/validators";
import { createAuthController } from "./auth.controller";
import type { AppContext } from "../../common/types/env";
import { rateLimit } from "../../common/middlewares/rateLimiter";
import { validateTurnstile } from "../../common/middlewares/turnstile";

import { authGuard } from "../../common/middlewares/authGuard";
import { csrfTokenGuard } from "../../common/middlewares/csrfTokenGuard";
import { z } from "zod";

const app = new OpenAPIHono<AppContext>();

// Apply CSRF Token Guard to all auth routes
app.use("*", csrfTokenGuard());

// Dependency Injection occurs dynamically inside the controllers based on context.
const authController = createAuthController();

const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Auth"],
  summary: "Register a new user",
  middleware: [
    rateLimit({ window: 60, limit: 3, keyPrefix: "auth:reg" }),
    validateTurnstile(),
    zValidator("json", RegisterSchema),
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } },
    },
  },
  responses: {
    201: {
      description: "User successfully registered",
      content: { "application/json": { schema: AuthSuccessSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Anti-bot validation failed",
      content: { "application/json": { schema: ErrorSchema } },
    },
    429: {
      description: "Too Many Requests",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Auth"],
  summary: "Authenticates user to yield JWT output variables",
  middleware: [
    rateLimit({ window: 60, limit: 5, keyPrefix: "auth:login" }),
    zValidator("json", LoginSchema),
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: LoginSchema } },
    },
  },
  responses: {
    200: {
      description: "User successfully logged in",
      content: { "application/json": { schema: AuthSuccessSchema } },
    },
    401: {
      description: "Unauthorized - Invalid credentials",
      content: { "application/json": { schema: ErrorSchema } },
    },
    429: {
      description: "Too Many Requests",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const unlinkRoute = createRoute({
  method: "delete",
  path: "/accounts/{provider}",
  tags: ["Auth"],
  summary: "Unlink an OAuth account",
  middleware: [rateLimit(), authGuard] as const,
  request: {
    params: z.object({
      provider: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Account successfully unlinked",
      content: {
        "application/json": {
          schema: z.object({ success: z.literal(true), data: z.any() }),
        },
      },
    },
    400: {
      description: "Cannot unlink the only method or general error",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const setup2faRoute = createRoute({
  method: "post",
  path: "/2fa/setup",
  tags: ["Auth"],
  summary: "Setup 2FA",
  middleware: [authGuard] as const,
  responses: {
    200: {
      description: "2FA details retrieved",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({ secret: z.string(), uri: z.string() }),
          }),
        },
      },
    },
    400: {
      description: "Error",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Not Found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const enable2faRoute = createRoute({
  method: "post",
  path: "/2fa/enable",
  tags: ["Auth"],
  summary: "Enable 2FA",
  middleware: [authGuard, zValidator("json", TwoFactorEnableSchema)] as const,
  request: {
    body: {
      content: { "application/json": { schema: TwoFactorEnableSchema } },
    },
  },
  responses: {
    200: {
      description: "2FA enabled",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({ recoveryCodes: z.array(z.string()) }),
          }),
        },
      },
    },
    400: {
      description: "Error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const verify2faRoute = createRoute({
  method: "post",
  path: "/2fa/verify",
  tags: ["Auth"],
  summary: "Verify 2FA Challenge",
  middleware: [rateLimit(), zValidator("json", TwoFactorVerifySchema)] as const,
  request: {
    body: {
      content: { "application/json": { schema: TwoFactorVerifySchema } },
    },
  },
  responses: {
    200: {
      description: "2FA verified, session created",
      content: { "application/json": { schema: AuthSuccessSchema } },
    },
    400: {
      description: "Error",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const refreshRoute = createRoute({
  method: "post",
  path: "/refresh",
  tags: ["Auth"],
  summary: "Refresh access token",
  middleware: [
    rateLimit({ window: 60, limit: 10, keyPrefix: "auth:refresh" }),
    zValidator("json", RefreshSchema),
  ] as const,
  request: {
    body: { content: { "application/json": { schema: RefreshSchema } } },
  },
  responses: {
    200: {
      description: "Tokens successfully refreshed",
      content: { "application/json": { schema: AuthSuccessSchema } },
    },
    401: {
      description: "Invalid or expired refresh token",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const recoveryRoute = createRoute({
  method: "post",
  path: "/recovery",
  tags: ["Auth"],
  summary: "Request password recovery",
  middleware: [
    rateLimit({ window: 60, limit: 2, keyPrefix: "auth:recovery" }),
    zValidator("json", ForgotPasswordSchema),
  ] as const,
  request: {
    body: { content: { "application/json": { schema: ForgotPasswordSchema } } },
  },
  responses: {
    200: {
      description: "Recovery email sent",
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
    },
  },
});

const resetPasswordRoute = createRoute({
  method: "post",
  path: "/reset-password",
  tags: ["Auth"],
  summary: "Reset password with token",
  middleware: [
    rateLimit({ window: 60, limit: 3, keyPrefix: "auth:reset" }),
    zValidator("json", ResetPasswordSchema),
  ] as const,
  request: {
    body: { content: { "application/json": { schema: ResetPasswordSchema } } },
  },
  responses: {
    200: {
      description: "Password successfully reset",
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
    },
    400: {
      description: "Invalid token or data",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});
const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  tags: ["Auth"],
  summary: "Terminate session",
  middleware: [rateLimit()] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ refreshToken: z.string() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Logged out",
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
    },
  },
});

export const authRouter = app
  .openapi(registerRoute, authController.register)
  .openapi(loginRoute, authController.login)
  .openapi(logoutRoute, authController.logout)
  .openapi(refreshRoute, authController.refresh)
  .openapi(recoveryRoute, authController.requestRecovery)
  .openapi(resetPasswordRoute, authController.resetPassword)
  .openapi(unlinkRoute, authController.unlinkProvider)
  .openapi(setup2faRoute, authController.setup2fa)
  .openapi(enable2faRoute, authController.enable2fa)
  .openapi(verify2faRoute, authController.verify2fa)
  // Non-RPC documented endpoints for redirection flows
  .get("/login/:provider", authController.socialLogin)
  .get("/callback/:provider", authController.oauthCallback)
  .get("/link/:provider", authController.linkProvider);
