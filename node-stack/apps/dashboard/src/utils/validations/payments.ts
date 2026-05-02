import { z } from "zod";

export const subscribeSchema = z.object({
  planId: z.string().min(1, { message: "El ID del plan es obligatorio" }),
  paymentMethodId: z
    .string()
    .min(1, { message: "El ID del método de pago es obligatorio" }),
});

export const cancelSchema = z.object({
  subscriptionId: z
    .string()
    .min(1, { message: "El ID de la suscripción es obligatorio" }),
});

export const paymentMethodSchema = z.object({
  cardNumber: z
    .string()
    .min(16, { message: "El número de tarjeta debe tener 16 dígitos" }),
  expirationDate: z
    .string()
    .min(5, { message: "La fecha de expiración es obligatoria" }),
  cvv: z.string().min(3, { message: "El CVV debe tener al menos 3 dígitos" }),
});

export const updatePaymentMethodSchema = z.object({
  paymentMethodId: z
    .string()
    .min(1, { message: "El ID del método de pago es obligatorio" }),
  cardNumber: z
    .string()
    .min(16, { message: "El número de tarjeta debe tener 16 dígitos" }),
  expirationDate: z
    .string()
    .min(5, { message: "La fecha de expiración es obligatoria" }),
  cvv: z.string().min(3, { message: "El CVV debe tener al menos 3 dígitos" }),
});

export type SubscribeFormData = z.infer<typeof subscribeSchema>;
export type CancelFormData = z.infer<typeof cancelSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
export type UpdatePaymentMethodFormData = z.infer<
  typeof updatePaymentMethodSchema
>;
