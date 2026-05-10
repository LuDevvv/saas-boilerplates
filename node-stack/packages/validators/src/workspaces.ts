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
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional()
    .describe("URL-friendly identifier; auto-generated from name if omitted"),
  industry: z.string().max(100).optional().describe("Sector or niche of the business"),
  teamSize: z.string().max(20).optional().describe("Number of employees (range)"),
  revenueRange: z.string().max(50).optional().describe("Monthly/annual revenue bracket"),
});

export class CreateWorkspaceDto extends createZodDto(CreateWorkspaceSchema) {
  @ApiProperty({ example: "Engineering Team", description: "Display name of the workspace" })
  declare name: string;

  @ApiProperty({ example: "engineering-team", description: "URL-friendly unique identifier", required: false })
  declare slug?: string;

  @ApiProperty({ example: "tech", required: false })
  declare industry?: string;

  @ApiProperty({ example: "2-6", required: false })
  declare teamSize?: string;

  @ApiProperty({ example: "50k-200k", required: false })
  declare revenueRange?: string;
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
