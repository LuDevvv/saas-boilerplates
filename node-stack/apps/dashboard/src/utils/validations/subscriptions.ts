import { z } from "zod";

export const subscriptionSchema = z.object({
  plan: z.string().min(1, { message: "El plan es obligatorio" }),
  startDate: z
    .string()
    .min(1, { message: "La fecha de inicio es obligatoria" }),
  endDate: z
    .string()
    .min(1, { message: "La fecha de finalización es obligatoria" }),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
