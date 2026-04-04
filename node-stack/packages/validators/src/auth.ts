import { createZodDto, ZodDto } from "nestjs-zod";
import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

// ── Register ──────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .trim()
    .describe("User's email address (e.g. user@example.com)"),
  password: password.describe("User's password (min 8 characters)"),
  name: z
    .string()
    .min(1)
    .max(100)
    .trim()
    .optional()
    .describe("Full name of the user (e.g. John Doe)"),
});
export class RegisterDto extends createZodDto(RegisterSchema) {}

// ── Login ─────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .trim()
    .describe("User's email address"),
  password: z.string().min(1).describe("User's password"),
});
export class LoginDto extends createZodDto(LoginSchema) {}

// ── Refresh ───────────────────────────────────────────────
export const RefreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1)
    .describe("Refresh token obtained during login"),
});
export class RefreshDto extends createZodDto(RefreshSchema) {}

// ── Verify 2FA ────────────────────────────────────────────
export const Verify2faSchema = z.object({
  token: z
    .string()
    .length(6, "Token must be exactly 6 digits")
    .regex(/^\d{6}$/, "Token must contain only digits")
    .describe("6-digit TOTP code (e.g. 123456)"),
});
export class Verify2faDto extends createZodDto(Verify2faSchema) {}

// ── Login 2FA ─────────────────────────────────────────────
export const Login2faSchema = z.object({
  tempToken: z
    .string()
    .min(1)
    .describe("Temporary token from initial login step"),
  token: z
    .string()
    .length(6, "Token must be exactly 6 digits")
    .regex(/^\d{6}$/, "Token must contain only digits")
    .describe("6-digit TOTP code (e.g. 123456)"),
});
export class Login2faDto extends createZodDto(Login2faSchema) {}

// ── Forgot Password ──────────────────────────────────────
export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .describe("Email to send reset link to"),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

// ── Reset Password ────────────────────────────────────────
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required").describe("Reset token from email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number",
    )
    .describe("New password for the account"),
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
