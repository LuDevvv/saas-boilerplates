import { z } from "./zod";

/**
 * Schema for creating a new invitation
 */
export const CreateInvitationSchema = z
  .object({
    email: z.string().email(),
    role: z.enum(["owner", "admin", "member"]).default("member"),
  })
  .openapi("CreateInvitationRequest");

/**
 * Schema for accepting an invitation
 */
export const AcceptInvitationSchema = z
  .object({
    token: z.string().min(1),
  })
  .openapi("AcceptInvitationRequest");

/**
 * Basic invitation output schema
 */
export const InvitationSchema = z
  .object({
    id: z.string().uuid(),
    workspaceId: z.string().uuid(),
    email: z.string().email(),
    role: z.string(),
    token: z.string(),
    expiresAt: z.string(),
    invitedBy: z.string().uuid(),
    createdAt: z.string(),
  })
  .openapi("Invitation");

export const InvitationSuccessSchema = z
  .object({
    success: z.boolean().default(true),
    data: InvitationSchema,
  })
  .openapi("InvitationSuccessResponse");

export const InvitationListSuccessSchema = z
  .object({
    success: z.boolean().default(true),
    data: z.array(InvitationSchema),
  })
  .openapi("InvitationListSuccessResponse");

export const AcceptInvitationSuccessSchema = z
  .object({
    success: z.boolean().default(true),
    data: z.object({
      message: z.string(),
    }),
  })
  .openapi("AcceptInvitationSuccessResponse");

export type CreateInvitationInput = z.infer<typeof CreateInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof AcceptInvitationSchema>;
