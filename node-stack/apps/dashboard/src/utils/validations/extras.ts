import { z } from "zod";

// Esquema base para validación de extras
const baseExtraSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  price: z.number().nonnegative("El precio debe ser mayor o igual a 0"),
  available: z.boolean().optional().default(true),
  companyId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

// Esquema para crear un extra
export const extraSchema = baseExtraSchema;

// Esquema para actualizar un extra (todos los campos opcionales)
export const updateExtraSchema = baseExtraSchema.partial();

// Esquema para asociar un extra a un producto
export const productExtraSchema = z.object({
  productId: z.string().min(1, "ID del producto requerido"),
  extraId: z.string().min(1, "ID del extra requerido"),
  price: z
    .number()
    .nonnegative("El precio debe ser mayor o igual a 0")
    .optional(),
  isDefault: z.boolean().optional().default(false),
});

// Esquema para actualizar una asociación de producto y extra
export const updateProductExtraSchema = z.object({
  price: z
    .number()
    .nonnegative("El precio debe ser mayor o igual a 0")
    .optional(),
  isDefault: z.boolean().optional(),
});
