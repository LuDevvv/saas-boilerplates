import { z } from "zod";

export const foodVariantSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es obligatorio" })
    .max(100, { message: "El nombre no puede exceder los 100 caracteres" }),

  price: z
    .string()
    .min(1, { message: "El precio es obligatorio" })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: "El precio debe ser un número válido con hasta 2 decimales",
    })
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0.01, {
      message: "El precio mínimo es 0.01",
    }),

  size: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || /^\d+$/.test(val), {
      message: "El tamaño debe ser un número entero válido",
    })
    .transform((val) => (val === "" ? 0 : parseInt(val, 10))),

  discount: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "El descuento debe ser un número válido",
    })
    .transform((val) => (val === "" ? 0 : parseFloat(val)))
    .refine((val) => val >= 0 && val <= 100, {
      message: "El descuento debe estar entre 0 y 100",
    }),

  is_default: z.boolean().default(false).optional(),

  preparationTime: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || /^\d+$/.test(val), {
      message: "El tiempo de preparación debe ser un número entero válido",
    })
    .transform((val) => (val === "" ? 0 : parseInt(val, 10)))
    .refine((val) => val >= 0, {
      message: "El tiempo de preparación no puede ser negativo",
    }),

  calories: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || /^\d+$/.test(val), {
      message: "Las calorías deben ser un número entero válido",
    })
    .transform((val) => (val === "" ? 0 : parseInt(val, 10)))
    .refine((val) => val >= 0, {
      message: "Las calorías no pueden ser negativas",
    }),

  ingredients: z.array(z.string()).default([]).optional(),

  unitOfMeasurementId: z.string().optional().default(""),

  available: z.boolean().default(true),
});

export type FoodVariantFormData = {
  name: string;
  price: string;
  size: string;
  discount?: string;
  is_default?: boolean;
  preparationTime?: string;
  calories?: string;
  ingredients?: string[];
  unitOfMeasurementId?: string;
  available: boolean;
};

export const getDefaultFoodVariantValues = (
  autoDefault = false
): FoodVariantFormData => ({
  name: "",
  price: "",
  size: "",
  discount: "",
  is_default: autoDefault,
  preparationTime: "",
  calories: "",
  ingredients: [],
  unitOfMeasurementId: "",
  available: true,
});
