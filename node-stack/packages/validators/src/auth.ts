import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and a number",
  );

// ── Register ──────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .trim()
    .describe("User's email address (e.g. user@example.com)"),
  password: strongPassword.describe("User's password (min 8 chars, mixed case, numbers)"),
  name: z
    .string()
    .min(1)
    .max(100)
    .trim()
    .optional()
    .describe("Full name of the user (e.g. John Doe)"),
});
export class RegisterDto extends createZodDto(RegisterSchema) {
  declare email: string;
  declare password: string;
  declare name?: string;
}

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
export class LoginDto extends createZodDto(LoginSchema) {
  declare email: string;
  declare password: string;
}

// ── Refresh ───────────────────────────────────────────────
export const RefreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1)
    .describe("Refresh token obtained during login"),
});
export class RefreshDto extends createZodDto(RefreshSchema) {
  declare refreshToken: string;
}

// ── Verify 2FA ────────────────────────────────────────────
export const Verify2faSchema = z.object({
  token: z
    .string()
    .length(6, "Token must be exactly 6 digits")
    .regex(/^\d{6}$/, "Token must contain only digits")
    .describe("6-digit TOTP code (e.g. 123456)"),
});
export class Verify2faDto extends createZodDto(Verify2faSchema) {
  declare token: string;
}

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
export class Login2faDto extends createZodDto(Login2faSchema) {
  declare tempToken: string;
  declare token: string;
}

// ── Forgot Password ──────────────────────────────────────
export const RecoverySchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .describe("Email to send reset link to"),
});
export class RecoveryDto extends createZodDto(RecoverySchema) {
  declare email: string;
}

export const ForgotPasswordSchema = RecoverySchema;
export class ForgotPasswordDto extends RecoveryDto {}

// ── Reset Password ────────────────────────────────────────
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required").describe("Reset token from email"),
  newPassword: strongPassword.describe("New password for the account"),
});
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {
  declare token: string;
  declare newPassword: string;
}

// ── Verify Email ──────────────────────────────────────────
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required").describe("Verification token from email"),
});
export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {
  declare token: string;
}
