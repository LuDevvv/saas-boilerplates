import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdateUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "super_admin"]),
});

export class UpdateUserRoleDto extends createZodDto(UpdateUserRoleSchema) {
  @ApiProperty({ example: "admin", enum: ["user", "admin", "super_admin"] })
  role!: "user" | "admin" | "super_admin";
}

export const SetConfigSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_:]+$/, "Key must be alphanumeric, underscores or colons"),
  value: z.any().describe("Any JSON value"),
  description: z.string().max(255).optional(),
});

export class SetConfigDto extends createZodDto(SetConfigSchema) {
  @ApiProperty({ example: "maintenance_mode", description: "Config key" })
  key!: string;

  @ApiProperty({ example: true, description: "Config value (any JSON)" })
  value: unknown;

  @ApiProperty({ example: "Disables all write operations", required: false })
  description?: string;
}
