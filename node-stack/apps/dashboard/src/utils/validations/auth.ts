import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es obligatorio" })
    .email({ message: "Ingresa un correo electrónico válido" }),
  password: z
    .string()
    .min(1, { message: "La contraseña es obligatoria" }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    firstName: z.string().min(1, { message: "El nombre es obligatorio" }),
    lastName: z.string().min(1, { message: "El apellido es obligatorio" }),
    email: z
      .string()
      .min(1, { message: "El correo electrónico es obligatorio" })
      .email({ message: "Ingresa un correo electrónico válido" }),
    phone: z
      .string()
      .min(10, { message: "Ingresa un número de teléfono válido" })
      .optional(),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
      .max(50, { message: "La contraseña no puede exceder los 50 caracteres" })
      .regex(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z])/, {
        message:
          "La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número.",
      }),
    confirmPassword: z.string(),
    acceptedTerms: z.literal(true, {
      message: "Debes aceptar los términos y condiciones"
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Por favor ingresa un email válido")
    .min(1, "El email es requerido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Por favor confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
