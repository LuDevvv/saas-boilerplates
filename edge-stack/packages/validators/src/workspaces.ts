import { z } from "./zod";

/**
 * Schema for creating a new workspace.
 */
export const CreateWorkspaceSchema = z
  .object({
    name: z.string().min(1).max(100),
    slug: z
      .string()
      .min(3)
      .max(50)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must only contain lowercase letters, numbers, and hyphens",
      ),
    logoUrl: z.string().url().optional(),
  })
  .openapi("CreateWorkspaceRequest");

/**
 * Schema for updating an existing workspace.
 */
export const UpdateWorkspaceSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    logoUrl: z.string().url().optional().nullable(),
  })
  .openapi("UpdateWorkspaceRequest");

/**
 * Schema for basic workspace information.
 */
export const WorkspaceSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    logoUrl: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi("Workspace");

/**
 * Schema for a workspace with user-specific role detail.
 */
export const UserWorkspaceSchema = WorkspaceSchema.extend({
  role: z.enum(["owner", "admin", "member"]),
}).openapi("UserWorkspace");

/**
 * Standard success response for workspace creation.
 */
export const WorkspaceSuccessSchema = z
  .object({
    success: z.boolean().default(true),
    data: WorkspaceSchema,
  })
  .openapi("WorkspaceSuccessResponse");

/**
 * Standard success response for listing workspaces.
 */
export const WorkspaceListSuccessSchema = z
  .object({
    success: z.boolean().default(true),
    data: z.array(UserWorkspaceSchema),
  })
  .openapi("WorkspaceListSuccessResponse");

export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type UserWorkspace = z.infer<typeof UserWorkspaceSchema>;

/**
 * Schema for updating a member's role within a workspace.
 */
export const UpdateMemberRoleSchema = z
  .object({
    role: z.enum(["admin", "member"]),
  })
  .openapi("UpdateMemberRoleRequest");

export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
