import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * {ModuleName} status enum for DTOs
 */
export const {!!moduleNameCamel}StatusDto = z.enum(["pending", "active", "inactive", "deleted"]);

/**
 * Create {ModuleName} DTO Schema
 */
export const Create{!!ModuleName}Schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters")
    .trim()
    .describe("Name of the {!!moduleName}"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .describe("Optional description"),
});

export class Create{!!ModuleName}Dto extends createZodDto(Create{!!ModuleName}Schema) {
  @ApiProperty({ description: "Name of the {!!moduleName}", example: "My {!!moduleName}" })
  declare name: string;

  @ApiPropertyOptional({ description: "Optional description", example: "A detailed description" })
  declare description?: string;
}

/**
 * Update {ModuleName} DTO Schema
 */
export const Update{!!ModuleName}Schema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .trim()
    .optional()
    .describe("Updated name"),
  description: z
    .string()
    .max(1000)
    .optional()
    .describe("Updated description"),
  status: {!!moduleNameCamel}StatusDto.optional().describe("Updated status"),
});

export class Update{!!ModuleName}Dto extends createZodDto(Update{!!ModuleName}Schema) {
  @ApiPropertyOptional({ description: "Updated name" })
  declare name?: string;

  @ApiPropertyOptional({ description: "Updated description" })
  declare description?: string;

  @ApiPropertyOptional({ description: "Updated status", enum: ["pending", "active", "inactive", "deleted"] })
  declare status?: "pending" | "active" | "inactive" | "deleted";
}

/**
 * List {ModuleName} Query DTO
 */
export const List{!!ModuleName}QuerySchema = z.object({
  status: {!!moduleNameCamel}StatusDto.optional().describe("Filter by status"),
  cursor: z.string().optional().describe("Pagination cursor"),
  limit: z.coerce.number().min(1).max(100).default(20).describe("Page size"),
});

export class List{!!ModuleName}QueryDto extends createZodDto(List{!!ModuleName}QuerySchema) {
  @ApiPropertyOptional({ description: "Filter by status", enum: ["pending", "active", "inactive", "deleted"] })
  declare status?: "pending" | "active" | "inactive" | "deleted";

  @ApiPropertyOptional({ description: "Pagination cursor" })
  declare cursor?: string;

  @ApiProperty({ description: "Page size", default: 20, minimum: 1, maximum: 100 })
  declare limit: number;
}

/**
 * {ModuleName} Response DTO
 */
export class {!!ModuleName}ResponseDto {
  @ApiProperty({ description: "Unique identifier" })
  id: string;

  @ApiProperty({ description: "Workspace ID" })
  workspaceId: string;

  @ApiProperty({ description: "Name" })
  name: string;

  @ApiPropertyOptional({ description: "Description" })
  description?: string;

  @ApiProperty({ description: "Status", enum: ["pending", "active", "inactive", "deleted"] })
  status: "pending" | "active" | "inactive" | "deleted";

  @ApiProperty({ description: "Created by user ID" })
  createdBy: string;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;

  @ApiPropertyOptional({ description: "Deletion timestamp" })
  deletedAt?: Date;
}
