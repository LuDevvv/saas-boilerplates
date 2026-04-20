import { z } from "zod";

export const UpdateUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "super_admin"]),
});

export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleSchema>;

export const SetConfigSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_:]+$/, "Key must be alphanumeric, underscores or colons"),
  value: z.any(),
  description: z.string().max(255).optional(),
});

export type SetConfigDto = z.infer<typeof SetConfigSchema>;
