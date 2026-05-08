import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// ── Workspace Creation ─────────────────────────────────────
export const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .trim()
    .describe("Name of the workspace"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .describe("Unique URL-friendly identifier for the workspace"),
});

export class CreateWorkspaceDto extends createZodDto(CreateWorkspaceSchema) {
  @ApiProperty({ example: "Engineering Team", description: "Display name of the workspace" })
  declare name: string;

  @ApiProperty({ example: "engineering-team", description: "URL-friendly unique identifier" })
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
  @ApiProperty({ example: "new-member@example.com" })
  declare email: string;

  @ApiProperty({ example: "member", enum: ["admin", "member", "guest"] })
  declare role: "admin" | "member" | "guest";
}

// ── Update Member ──────────────────────────────────────────
export const UpdateMemberRoleSchema = z.object({
  role: z
    .enum(["admin", "member", "guest"])
    .describe("New role for the workspace member"),
});

export class UpdateMemberRoleDto extends createZodDto(UpdateMemberRoleSchema) {
  @ApiProperty({ example: "admin", enum: ["admin", "member", "guest"] })
  declare role: "admin" | "member" | "guest";
}

// ── Update Workspace ─────────────────────────────────────
export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  logoUrl: z.string().url().nullable().optional(),
});

export class UpdateWorkspaceDto extends createZodDto(UpdateWorkspaceSchema) {
  @ApiProperty({ example: "Acme Corp", required: false })
  declare name?: string;

  @ApiProperty({ example: "acme-corp", required: false })
  declare slug?: string;

  @ApiProperty({ example: "https://example.com/logo.png", required: false, nullable: true })
  declare logoUrl?: string | null;
}
