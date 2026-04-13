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
