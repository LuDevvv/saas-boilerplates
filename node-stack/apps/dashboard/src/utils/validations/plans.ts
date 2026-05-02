import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(1, { message: "El nombre del plan es obligatorio" }),
  description: z
    .string()
    .min(1, { message: "La descripción del plan es obligatoria" }),
  price: z
    .number()
    .min(0, { message: "El precio debe ser un número positivo" }),
});

export type PlanFormData = z.infer<typeof planSchema>;
