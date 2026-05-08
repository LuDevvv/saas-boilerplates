import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateApiKeySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .trim()
    .describe("Name for the API key"),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .describe("Optional expiration date in ISO format"),
});

export class CreateApiKeyDto extends createZodDto(CreateApiKeySchema) {
  @ApiProperty({ example: "Production App", description: "A descriptive name for the API key" })
  declare name: string;

  @ApiProperty({ example: "2025-12-31T23:59:59Z", required: false, description: "Optional expiration date" })
  declare expiresAt?: string;
}
