import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Correo electrónico inválido"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const companySchema = z.object({
  name: z.string().min(2, "El nombre de la compañía es obligatorio"),
  description: z.string().optional().or(z.literal("")),
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
