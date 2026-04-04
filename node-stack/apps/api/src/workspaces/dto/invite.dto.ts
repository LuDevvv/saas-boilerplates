import { z } from "zod";

export const inviteDto = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "member"]).optional().default("member"),
});

export type InviteDto = z.infer<typeof inviteDto>;
