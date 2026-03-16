import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import {
  UpdateProfileSchema,
  ProfileSuccessSchema,
  UpdateProfileSuccessSchema,
} from "@workspace/validators";
import { UserController } from "./user.controller";
import { authGuard } from "../../common/middlewares/authGuard";
import { rateLimit } from "../../common/middlewares/rateLimiter";
import { ErrorSchema, UserSchema } from "@workspace/validators";
import type { AppContext } from "../../common/types/env";

const app = new OpenAPIHono<AppContext>();

const getProfileRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Users"],
  summary: "Get current user profile",
  description:
    "Returns the authenticated user's details including their workspace memberships.",
  middleware: [
    rateLimit({ window: 60, limit: 30, keyPrefix: "user:get" }),
    authGuard,
  ] as const,
  responses: {
    200: {
      description: "Profile successfully retrieved",
      content: { "application/json": { schema: ProfileSuccessSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const updateProfileRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["Users"],
  summary: "Update user profile",
  description: "Allows the authenticated user to update their name or avatar.",
  middleware: [
    rateLimit({ window: 60, limit: 10, keyPrefix: "user:update" }),
    authGuard,
    zValidator("json", UpdateProfileSchema),
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: UpdateProfileSchema } },
    },
  },
  responses: {
    200: {
      description: "Profile successfully updated",
      content: { "application/json": { schema: UpdateProfileSuccessSchema } },
    },
    400: {
      description: "Update failed",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const changePasswordRoute = createRoute({
  method: "post",
  path: "/password",
  tags: ["Users"],
  summary: "Change user password",
  middleware: [
    rateLimit({ window: 60, limit: 5, keyPrefix: "user:password" }),
    authGuard,
  ] as const,
  responses: {
    200: {
      description: "Password updated successfully",
      content: {
        "application/json": {
          schema: z
            .object({
              success: z.boolean().default(true),
              data: z.object({ message: z.string() }),
            })
            .openapi("ChangePasswordSuccessResponse"),
        },
      },
    },
  },
});

const deleteAccountRoute = createRoute({
  method: "delete",
  path: "/me",
  tags: ["Users"],
  summary: "Delete user account",
  description: "Permanently deletes the user profile and all associated data.",
  middleware: [
    rateLimit({ window: 60, limit: 1, keyPrefix: "user:delete" }),
    authGuard,
  ] as const,
  responses: {
    200: {
      description: "Account deleted successfully",
      content: {
        "application/json": {
          schema: z
            .object({
              success: z.boolean().default(true),
              data: z.object({ message: z.string() }),
            })
            .openapi("DeleteAccountSuccessResponse"),
        },
      },
    },
  },
});

const uploadAvatarRoute = createRoute({
  method: "post",
  path: "/avatar",
  tags: ["Users"],
  summary: "Upload profile avatar",
  middleware: [
    rateLimit({ window: 60, limit: 5, keyPrefix: "user:avatar" }),
    authGuard,
  ] as const,
  responses: {
    200: {
      description: "Avatar uploaded successfully",
      content: { "application/json": { schema: UpdateProfileSuccessSchema } },
    },
  },
});

export const userRouter = app
  .openapi(getProfileRoute, UserController.getProfile)
  .openapi(updateProfileRoute, UserController.updateProfile)
  .openapi(changePasswordRoute, UserController.changePassword)
  .openapi(deleteAccountRoute, UserController.deleteAccount)
  .openapi(uploadAvatarRoute, UserController.uploadAvatar);
