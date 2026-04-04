import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiKeyScope } from "@node-stack/types";

export const CreateApiKeySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .describe("Name for the API key (e.g. 'Production App')"),
  scopes: z
    .array(z.nativeEnum(ApiKeyScope))
    .min(1)
    .describe("List of permissions for the key"),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .describe("Optional expiration date in ISO format"),
});

export class CreateApiKeyDto extends createZodDto(CreateApiKeySchema) {}
