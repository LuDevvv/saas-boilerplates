import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// ── Workspace Creation ─────────────────────────────────────
export const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .trim()
    .describe("Name of the workspace (e.g. 'Engineering Team')"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .describe("Unique URL-friendly identifier for the workspace"),
});

export class CreateWorkspaceDto extends createZodDto(CreateWorkspaceSchema) {
  declare name: string;
  declare slug: string;
}

// ── Member Invitation ──────────────────────────────────────
export const InviteMemberSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .describe("Email of the person to invite"),
  role: z
    .enum(["admin", "member", "guest"])
    .default("member")
    .describe("Role to assign to the invited user"),
});

export class InviteMemberDto extends createZodDto(InviteMemberSchema) {
  declare email: string;
  declare role: "admin" | "member" | "guest";
}

// ── Update Member ──────────────────────────────────────────
export const UpdateMemberRoleSchema = z.object({
  role: z
    .enum(["admin", "member", "guest"])
    .describe("New role for the workspace member"),
});

export class UpdateMemberRoleDto extends createZodDto(UpdateMemberRoleSchema) {
  declare role: "admin" | "member" | "guest";
}

// ── Update Workspace ─────────────────────────────────────
export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  logoUrl: z.string().url().nullable().optional(),
});

export class UpdateWorkspaceDto extends createZodDto(UpdateWorkspaceSchema) {
  declare name?: string;
  declare slug?: string;
  declare logoUrl?: string | null;
}
