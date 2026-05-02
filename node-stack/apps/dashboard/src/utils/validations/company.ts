import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es obligatorio"),
  description: z.string().optional(),
  niche: z.string().optional(),
  nicheCustom: z.string().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
