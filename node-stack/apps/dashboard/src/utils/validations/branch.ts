import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email("Formato de email inválido")
    .optional()
    .or(z.literal("")),
  currencyId: z.string().min(1, "La moneda es requerida"),
  shoppingCart: z.boolean().optional(),
  hasDeliveries: z.boolean().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  domain: z
    .string()
    .min(3, "El dominio debe tener al menos 3 caracteres")
    .regex(
      /^[a-z0-9]([a-z0-9-.]*[a-z0-9])?$/,
      "Formato de dominio inválido"
    )
    .refine((val) => {
      if (!val) return true;
      const reserved = [
        "admin", "api", "dashboard", "auth", "www", "app", "status", "dev",
        "mail", "blog", "docs", "support", "billing", "account", "profile",
        "settings", "legal", "terms", "privacy"
      ];
      return !reserved.includes(val.toLowerCase());
    }, "Este subdominio está reservado para el sistema"),
  googleMaps: z.string().optional(),
  deliveryCost: z.union([z.coerce.number().min(0), z.literal(""), z.null()]).optional(),
  themeId: z.string().optional(),
});

export type BranchFormData = z.infer<typeof branchSchema>;
