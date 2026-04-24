import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

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
    .describe("User's email address"),
  password: strongPassword.describe("User's password"),
  name: z
    .string()
    .min(1)
    .max(100)
    .trim()
    .optional()
    .describe("Full name of the user"),
});
export class RegisterDto extends createZodDto(RegisterSchema) {
  @ApiProperty({ example: "user@example.com", description: "User's email address" })
  declare email: string;

  @ApiProperty({ example: "Password123!", description: "User's password (min 8 chars, mixed case, numbers)" })
  declare password: string;

  @ApiProperty({ example: "John Doe", description: "Full name of the user", required: false })
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
  @ApiProperty({ example: "user@example.com" })
  declare email: string;

  @ApiProperty({ example: "Password123!" })
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
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  declare refreshToken: string;
}

// ── Verify 2FA ────────────────────────────────────────────
export const Verify2faSchema = z.object({
  token: z
    .string()
    .length(6, "Token must be exactly 6 digits")
    .regex(/^\d{6}$/, "Token must contain only digits")
    .describe("6-digit TOTP code"),
});
export class Verify2faDto extends createZodDto(Verify2faSchema) {
  @ApiProperty({ example: "123456", description: "6-digit TOTP code from authenticator app" })
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
    .describe("6-digit TOTP code"),
});
export class Login2faDto extends createZodDto(Login2faSchema) {
  @ApiProperty({ example: "temp_token_123" })
  declare tempToken: string;

  @ApiProperty({ example: "123456" })
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
  @ApiProperty({ example: "user@example.com" })
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
  @ApiProperty({ example: "reset_token_123" })
  declare token: string;

  @ApiProperty({ example: "NewPassword123!" })
  declare newPassword: string;
}

// ── Verify Email ──────────────────────────────────────────
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required").describe("Verification token from email"),
});
export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {
  @ApiProperty({ example: "verify_token_123" })
  declare token: string;
}
