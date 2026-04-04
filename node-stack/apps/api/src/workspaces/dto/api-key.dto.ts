import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(255).trim(),
  expiresAt: z.string().datetime().optional(),
});

export class CreateApiKeyDto extends createZodDto(createApiKeySchema) {}

export class ApiKeyResponseDto {
  id: string;
  name: string;
  keyPreview: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateApiKeyResponseDto extends ApiKeyResponseDto {
  plainKey: string; // ONLY RETURNED ONCE!
}
