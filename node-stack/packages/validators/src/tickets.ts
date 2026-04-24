import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * {ModuleName} status enum for DTOs
 */
export const ticketStatusDto = z.enum(["pending", "active", "inactive", "deleted"]);

/**
 * Create {ModuleName} DTO Schema
 */
export const CreateTicketSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters")
    .trim()
    .describe("Name of the ticket"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .describe("Optional description"),
});

export class CreateTicketDto extends createZodDto(CreateTicketSchema) {
  @ApiProperty({ description: "Name of the ticket", example: "My ticket" })
  declare name: string;

  @ApiPropertyOptional({ description: "Optional description", example: "A detailed description" })
  declare description?: string;
}

/**
 * Update {ModuleName} DTO Schema
 */
export const UpdateTicketSchema = z.object({
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
  status: ticketStatusDto.optional().describe("Updated status"),
});

export class UpdateTicketDto extends createZodDto(UpdateTicketSchema) {
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
export const ListTicketQuerySchema = z.object({
  status: ticketStatusDto.optional().describe("Filter by status"),
  cursor: z.string().optional().describe("Pagination cursor"),
  limit: z.coerce.number().min(1).max(100).default(20).describe("Page size"),
});

export class ListTicketQueryDto extends createZodDto(ListTicketQuerySchema) {
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
export class TicketResponseDto {
  @ApiProperty({ description: "Unique identifier" })
  declare id: string;

  @ApiProperty({ description: "Workspace ID" })
  declare workspaceId: string;

  @ApiProperty({ description: "Name" })
  declare name: string;

  @ApiPropertyOptional({ description: "Description" })
  declare description: string | null;

  @ApiProperty({ description: "Status", enum: ["pending", "active", "inactive", "deleted"] })
  declare status: "pending" | "active" | "inactive" | "deleted";

  @ApiProperty({ description: "Created by user ID" })
  declare createdBy: string;

  @ApiProperty({ description: "Creation timestamp" })
  declare createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  declare updatedAt: Date;

  @ApiPropertyOptional({ description: "Deletion timestamp" })
  declare deletedAt: Date | null;
}
