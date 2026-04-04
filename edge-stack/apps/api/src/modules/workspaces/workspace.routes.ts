import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import {
  CreateWorkspaceSchema,
  WorkspaceSuccessSchema,
  WorkspaceListSuccessSchema,
  UpdateWorkspaceSchema,
  UpdateMemberRoleSchema,
} from "@workspace/validators";
import {
  CreateInvitationSchema,
  AcceptInvitationSchema,
  InvitationSuccessSchema,
  InvitationListSuccessSchema,
  AcceptInvitationSuccessSchema,
} from "@workspace/validators";
import { WorkspaceController } from "./workspace.controller";
import { InvitationController } from "./invitation.controller";
import { authGuard } from "../../common/middlewares/authGuard";
import { workspaceGuard } from "../../common/middlewares/workspaceGuard";
import { requirePermission } from "../../common/middlewares/permissionGuard";
import { rateLimit } from "../../common/middlewares/rateLimiter";
import { TIER_LIMITS } from "@workspace/services";
import { ErrorSchema } from "@workspace/validators";
import type { AppContext } from "../../common/types/env";

const app = new OpenAPIHono<AppContext>();

const createWorkspaceRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Workspaces"],
  summary: "Create a new organization",
  description:
    "Initializes a new workspace and sets the authenticated user as the owner.",
  middleware: [
    rateLimit({ window: 60, limit: 5, keyPrefix: "workspace:create" }),
    authGuard,
    zValidator("json", CreateWorkspaceSchema),
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: CreateWorkspaceSchema } },
    },
  },
  responses: {
    201: {
      description: "Workspace successfully created",
      content: { "application/json": { schema: WorkspaceSuccessSchema } },
    },
    400: {
      description: "Invalid input or duplicate slug",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized - missing or invalid token",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const listWorkspacesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Workspaces"],
  summary: "List user organizations",
  description:
    "Returns all workspaces where the current user has an active membership.",
  middleware: [
    rateLimit({ window: 60, limit: 30, keyPrefix: "workspace:list" }),
    authGuard,
  ] as const,
  responses: {
    200: {
      description: "List of workspaces retrieved successfully",
      content: { "application/json": { schema: WorkspaceListSuccessSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const updateSettingsRoute = createRoute({
  method: "patch",
  path: "/settings",
  tags: ["Workspaces"],
  summary: "Update workspace settings",
  description: "Mutate the workspace parameters like Name and Logo.",
  middleware: [
    authGuard,
    workspaceGuard,
    rateLimit({
      window: 60,
      limit: 20,
      keyPrefix: "workspace:update",
      tierLimits: TIER_LIMITS,
    }),
    requirePermission("workspace.update"),
    zValidator("json", UpdateWorkspaceSchema),
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: UpdateWorkspaceSchema } },
    },
  },
  responses: {
    200: {
      description: "Workspace successfully updated",
      content: { "application/json": { schema: WorkspaceSuccessSchema } }, // Note returns the Workspace details via Success Schema
    },
    400: {
      description: "Invalid context",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden - Insufficient permissions",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const listMembersRoute = createRoute({
  method: "get",
  path: "/members",
  tags: ["Workspaces"],
  summary: "List workspace members",
  description: "Returns all members of the active workspace.",
  middleware: [
    authGuard,
    workspaceGuard,
    rateLimit({
      window: 60,
      limit: 30,
      keyPrefix: "workspace:members:list",
      tierLimits: TIER_LIMITS,
    }),
    requirePermission("workspace.members.read"),
  ] as const,
  responses: {
    200: {
      description: "List of members retrieved successfully",
      content: { "application/json": { schema: z.any() } }, // Schema mocked for speed
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const inviteMemberRoute = createRoute({
  method: "post",
  path: "/invitations",
  tags: ["Workspaces", "Invitations"],
  summary: "Invite member to workspace",
  description: "Create an invitation and send email.",
  middleware: [
    rateLimit({ window: 60, limit: 10, keyPrefix: "workspace:invite" }),
    authGuard,
    workspaceGuard,
    requirePermission("workspace.members.create"),
    zValidator("json", CreateInvitationSchema),
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: CreateInvitationSchema } },
    },
  },
  responses: {
    201: {
      description: "Invitation created",
      content: { "application/json": { schema: InvitationSuccessSchema } },
    },
    400: {
      description: "Invalid input",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const listInvitationsRoute = createRoute({
  method: "get",
  path: "/invitations",
  tags: ["Workspaces", "Invitations"],
  summary: "List workspace invitations",
  description: "Returns all pending invitations.",
  middleware: [
    rateLimit({
      window: 60,
      limit: 30,
      keyPrefix: "workspace:invitations:list",
    }),
    authGuard,
    workspaceGuard,
    requirePermission("workspace.members.read"),
  ] as const,
  responses: {
    200: {
      description: "Invitations retrieved",
      content: { "application/json": { schema: InvitationListSuccessSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const acceptInvitationRoute = createRoute({
  method: "post",
  path: "/invitations/accept",
  tags: ["Workspaces", "Invitations"],
  summary: "Accept an invitation",
  description: "Accept token and join workspace.",
  middleware: [
    rateLimit({
      window: 60,
      limit: 10,
      keyPrefix: "workspace:invitations:accept",
    }),
    authGuard,
    zValidator("json", AcceptInvitationSchema),
  ] as const,
  request: {
    body: {
      content: { "application/json": { schema: AcceptInvitationSchema } },
    },
  },
  responses: {
    200: {
      description: "Invitation accepted",
      content: {
        "application/json": { schema: AcceptInvitationSuccessSchema },
      },
    },
    400: {
      description: "Invalid or expired token",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const removeMemberRoute = createRoute({
  method: "delete",
  path: "/members/{userId}",
  tags: ["Workspaces"],
  summary: "Remove workspace member",
  middleware: [
    rateLimit({ window: 60, limit: 10, keyPrefix: "workspace:members:remove" }),
    authGuard,
    workspaceGuard,
    requirePermission("workspace.members.delete"),
  ] as const,
  request: {
    params: z.object({
      userId: z
        .string()
        .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
  },
  responses: {
    200: {
      description: "Member removed",
      content: {
        "application/json": {
          schema: z
            .object({
              success: z.boolean().default(true),
              data: z.object({ message: z.string() }),
            })
            .openapi("RemoveMemberSuccessResponse"),
        },
      },
    },
    400: {
      description: "Invalid ID",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const updateMemberRoleRoute = createRoute({
  method: "patch",
  path: "/members/{userId}",
  tags: ["Workspaces"],
  summary: "Update member role",
  middleware: [
    rateLimit({ window: 60, limit: 10, keyPrefix: "workspace:members:update" }),
    authGuard,
    workspaceGuard,
    requirePermission("workspace.members.update"),
    zValidator("json", UpdateMemberRoleSchema),
  ] as const,
  request: {
    params: z.object({
      userId: z
        .string()
        .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
    body: {
      content: { "application/json": { schema: UpdateMemberRoleSchema } },
    },
  },
  responses: {
    200: {
      description: "Role updated",
      content: {
        "application/json": {
          schema: z
            .object({
              success: z.boolean().default(true),
              data: z.object({ message: z.string() }),
            })
            .openapi("UpdateMemberRoleSuccessResponse"),
        },
      },
    },
    400: {
      description: "Invalid input",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const getAuditLogsRoute = createRoute({
  method: "get",
  path: "/audit",
  tags: ["Workspaces"],
  summary: "Get workspace audit logs",
  middleware: [
    rateLimit({ window: 60, limit: 20, keyPrefix: "workspace:audit" }),
    authGuard,
    workspaceGuard,
    requirePermission("workspace.audit.read"),
  ] as const,
  responses: {
    200: {
      description: "Audit logs retrieved",
      content: { "application/json": { schema: z.any() } },
    },
  },
});

const uploadLogoRoute = createRoute({
  method: "post",
  path: "/logo",
  tags: ["Workspaces"],
  summary: "Upload workspace logo",
  middleware: [
    rateLimit({ window: 60, limit: 5, keyPrefix: "workspace:logo" }),
    authGuard,
    workspaceGuard,
    requirePermission("workspace.update"),
  ] as const,
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z
              .any()
              .openapi({
                type: "string",
                format: "binary",
                description: "The image file to upload",
              }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Logo uploaded successfully",
      content: { "application/json": { schema: WorkspaceSuccessSchema } },
    },
  },
});

export const workspaceRouter = app
  .openapi(createWorkspaceRoute, WorkspaceController.create)
  .openapi(listWorkspacesRoute, WorkspaceController.list)
  .openapi(updateSettingsRoute, WorkspaceController.updateSettings)
  .openapi(inviteMemberRoute, InvitationController.create)
  .openapi(listInvitationsRoute, InvitationController.list)
  .openapi(acceptInvitationRoute, InvitationController.accept)
  .openapi(listMembersRoute, WorkspaceController.listMembers)
  .openapi(removeMemberRoute, WorkspaceController.removeMember)
  .openapi(updateMemberRoleRoute, WorkspaceController.updateMemberRole)
  .openapi(getAuditLogsRoute, WorkspaceController.getAuditLogs)
  .openapi(uploadLogoRoute, WorkspaceController.uploadLogo);
