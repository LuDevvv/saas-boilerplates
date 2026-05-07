import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export const TicketStatusSchema = z.enum(["pending", "active", "inactive", "deleted"]);

export const CreateTicketSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().min(1, "Description is required"),
});

export class CreateTicketDto extends createZodDto(CreateTicketSchema) {
  @ApiProperty({ description: "Name/Subject of the ticket" })
  declare name: string;

  @ApiProperty({ description: "Detailed description" })
  declare description: string;
}

export const UpdateTicketSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: TicketStatusSchema.optional(),
});

export class UpdateTicketDto extends createZodDto(UpdateTicketSchema) {}

export const ListTicketQuerySchema = z.object({
  status: TicketStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export class ListTicketQueryDto extends createZodDto(ListTicketQuerySchema) {}

export class TicketResponseDto {
  @ApiProperty()
  declare id: string;

  @ApiProperty()
  declare workspaceId: string;

  @ApiProperty()
  declare name: string;

  @ApiProperty()
  declare description: string | null;

  @ApiProperty({ enum: ["pending", "active", "inactive", "deleted"] })
  declare status: "pending" | "active" | "inactive" | "deleted";

  @ApiProperty()
  declare createdBy: string;

  @ApiProperty()
  declare createdAt: Date;

  @ApiProperty()
  declare updatedAt: Date;
}
