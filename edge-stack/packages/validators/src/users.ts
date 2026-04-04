import { z } from "./zod";
import { UserSchema } from "./auth";
import { UserWorkspaceSchema } from "./workspaces";

/**
 * Schema for updating user profile information.
 */
export const UpdateProfileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url().optional(),
  })
  .openapi("UpdateProfileRequest");

/**
 * Detailed user profile response including membership context.
 */
export const ProfileDataSchema = UserSchema.extend({
  workspaces: z.array(UserWorkspaceSchema),
  accounts: z.array(z.string()),
}).openapi("ProfileData");

/**
 * Success response for retrieving the authenticated user's profile.
 */
export const ProfileSuccessSchema = z
  .object({
    success: z.boolean().default(true),
    data: ProfileDataSchema,
  })
  .openapi("ProfileSuccessResponse");

export const UpdateProfileSuccessSchema = z
  .object({
    success: z.boolean().default(true),
    data: UserSchema,
  })
  .openapi("UpdateProfileSuccessResponse");

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * Schema for changing account password.
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  })
  .openapi("ChangePasswordRequest");

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
