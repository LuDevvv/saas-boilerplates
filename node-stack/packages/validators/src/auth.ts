import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña debe tener como máximo 128 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "La contraseña debe contener mayúsculas, minúsculas y un número",
  );

// ── Register ──────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase()
    .trim()
    .describe("Correo electrónico del usuario"),
  password: strongPassword.describe("Contraseña del usuario"),
  firstName: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100)
    .trim()
    .describe("User's first name"),
  lastName: z
    .string()
    .max(100)
    .trim()
    .optional()
    .describe("User's last name"),
  phone: z
    .string()
    .min(5)
    .max(20)
    .optional()
    .describe("User's phone number"),
});
export class RegisterDto extends createZodDto(RegisterSchema) {}

// ── Sign Up (UI-centric) ──────────────────────────────────
export const SignUpSchema = RegisterSchema.extend({
  confirmPassword: z.string(),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
export type SignUpDto = z.infer<typeof SignUpSchema>;

// ── Login ─────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase()
    .trim()
    .describe("Correo electrónico del usuario"),
  password: z.string().min(1, "La contraseña es obligatoria").describe("Contraseña del usuario"),
  rememberMe: z.boolean().optional().default(false).describe("Mantenerme conectado"),
});
export class LoginDto extends createZodDto(LoginSchema) {
  @ApiProperty({ example: "user@example.com" })
  declare email: string;

  @ApiProperty({ example: "Password123!" })
  declare password: string;

  @ApiProperty({ example: true, required: false })
  declare rememberMe: boolean;
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
    .length(6, "El código debe tener exactamente 6 dígitos")
    .regex(/^\d{6}$/, "El código debe contener solo números")
    .describe("Código TOTP de 6 dígitos"),
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
  rememberMe: z.boolean().optional().default(false).describe("Keep me logged in"),
});
export class Login2faDto extends createZodDto(Login2faSchema) {
  @ApiProperty({ example: "temp_token_123" })
  declare tempToken: string;

  @ApiProperty({ example: "123456" })
  declare token: string;

  @ApiProperty({ example: true, required: false })
  declare rememberMe: boolean;
}

// ── Forgot Password ──────────────────────────────────────
export const RecoverySchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase()
    .trim()
    .describe("Correo para enviar el enlace de recuperación"),
});
export class RecoveryDto extends createZodDto(RecoverySchema) {
  @ApiProperty({ example: "user@example.com" })
  declare email: string;
}

export const ForgotPasswordSchema = RecoverySchema;
export class ForgotPasswordDto extends RecoveryDto {}

// ── Reset Password ────────────────────────────────────────
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "El token es obligatorio").describe("Token de recuperación"),
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
  token: z.string().optional().describe("Verification token from email"),
  email: z.string().email().optional().describe("User email address"),
  code: z.string().length(6).optional().describe("6-digit verification code"),
});
export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {
  @ApiProperty({ example: "verify_token_123", required: false })
  declare token?: string;

  @ApiProperty({ example: "user@example.com", required: false })
  declare email?: string;

  @ApiProperty({ example: "123456", required: false })
  declare code?: string;
}

// ── Update Profile ────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional().describe("User's first name"),
  lastName: z.string().max(100).optional().describe("User's last name"),
  phone: z.string().min(5).max(20).optional().describe("User's phone number"),
  avatarUrl: z.string().url().optional().describe("User's avatar URL"),
});
export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {
  @ApiProperty({ example: "John", required: false })
  declare firstName?: string;

  @ApiProperty({ example: "Doe", required: false })
  declare lastName?: string;

  @ApiProperty({ example: "+1234567890", required: false })
  declare phone?: string;

  @ApiProperty({ example: "https://example.com/avatar.png", required: false })
  declare avatarUrl?: string;
}
