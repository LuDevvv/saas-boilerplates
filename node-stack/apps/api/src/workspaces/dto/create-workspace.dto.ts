import { z } from "zod";

export const createWorkspaceDto = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceDto>;
