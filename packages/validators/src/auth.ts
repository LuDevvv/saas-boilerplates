import { z } from "./zod";

/**
 * Schema for user registration requests.
 */
export const RegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
    "cf-turnstile-response": z.string(),
  })
  .openapi("RegisterRequest");

/**
 * Schema for login requests.
 */
export const LoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .openapi("LoginRequest");

/**
 * Schema for basic user information.
 */
export const UserSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
    avatarUrl: z.string().nullish(),
    twoFactorEnabled: z.boolean().optional(),
  })
  .openapi("User");

/**
 * Schema for successful authentication payload.
 */
export const AuthSuccessDataSchema = z
  .object({
    token: z.string(),
    refreshToken: z.string().optional(),
    user: UserSchema.optional(),
    pending2fa: z.boolean().optional(),
  })
  .openapi("AuthSuccessData");

/**
 * Standard success response schema for authentication.
 */
export const AuthSuccessSchema = z
  .object({
    success: z.boolean().default(true),
    data: AuthSuccessDataSchema,
  })
  .openapi("AuthSuccessResponse");

/**
 * Standard error response schema.
 */
export const ErrorSchema = z
  .object({
    success: z.boolean().default(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
    }),
  })
  .openapi("ErrorResponse");

export const TwoFactorEnableSchema = z
  .object({
    token: z.string(),
  })
  .openapi("TwoFactorEnableRequest");

export const TwoFactorVerifySchema = z
  .object({
    token: z.string().optional(),
    recoveryCode: z.string().optional(),
  })
  .openapi("TwoFactorVerifyRequest");

export const ForgotPasswordSchema = z
  .object({
    email: z.string().email(),
  })
  .openapi("ForgotPasswordRequest");

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
  })
  .openapi("ResetPasswordRequest");

export const RefreshSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .openapi("RefreshRequest");

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type AuthSuccessData = z.infer<typeof AuthSuccessDataSchema>;
export type User = z.infer<typeof UserSchema>;
