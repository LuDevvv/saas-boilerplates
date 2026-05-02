import { z } from "zod";

export const advertisementSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "El título no puede exceder los 100 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede exceder los 500 caracteres")
    .optional()
    .nullable(),
  link: z
    .string()
    .url("Por favor ingrese una URL válida (ej. https://ejemplo.com)")
    .optional()
    .nullable()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
  branchId: z.string().optional(),
});

export type AdvertisementFormData = z.infer<typeof advertisementSchema>;
