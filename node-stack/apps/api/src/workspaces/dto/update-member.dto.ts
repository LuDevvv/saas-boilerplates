import { z } from "zod";

export const updateMemberRoleDto = z.object({
  role: z.enum(["admin", "member"]),
});

export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleDto>;
