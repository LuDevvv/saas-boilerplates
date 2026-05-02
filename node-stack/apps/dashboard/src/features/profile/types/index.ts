import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const companySchema = z.object({
  name: z.string().min(2, "El nombre de la empresa es obligatorio"),
  vatNumber: z.string().min(5, "CIF/NIF inválido"),
  website: z.string().url("Sitio web inválido").or(z.literal("")),
  industry: z.string().min(2, "Especifica el sector"),
  address: z.string().min(5, "La dirección es obligatoria"),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

export interface SessionHistoryItem {
  id: string;
  device: string;
  location: string;
  ip: string;
  time: string;
  isActive: boolean;
}

export interface AuditLogItem {
  id: string;
  description: string;
  date: string;
  author: string;
}