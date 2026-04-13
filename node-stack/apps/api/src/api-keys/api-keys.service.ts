import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApiKeyRepository,
  withTransaction,
  schema,
  generateApiKey,
  hashKey,
  getKeyPreview,
} from '@node-stack/db';
import { CacheService } from '@node-stack/cache';
import {
  ApiKeyResponseDto,
  CreateApiKeyResponseDto,
} from '../workspaces/dto/api-key.dto';
import { CreateApiKeyDto } from '@node-stack/validators';

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly repo: ApiKeyRepository,
    private readonly cache: CacheService,
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<CreateApiKeyResponseDto> {
    const plainKey = generateApiKey();
    const keyHash = hashKey(plainKey);
    const keyPreview = getKeyPreview(plainKey);
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    let outboxEventId: string | null = null;
    const record = await withTransaction(async (tx) => {
      const key = await this.repo.create({
        workspaceId,
        userId,
        name: dto.name,
        keyHash,
        keyPreview,
        expiresAt,
      }, tx as any);

      // maintain consistency with existing outbox pattern
      const [outboxRecord] = await tx
        .insert(schema.outbox)
        .values({
          eventType: 'api_key.created',
          payload: { apiKeyId: key.id, workspaceId: key.workspaceId },
        })
        .returning();
      outboxEventId = outboxRecord.id;
      
      return key;
    });

    // In a real app, you'd trigger the outbox worker here via job queue if needed
    // or rely on a separate polling service.

    return {
      ...this.mapToDto(record),
      plainKey, // ONLY RETURNED ONCE!
    };
  }

  async list(workspaceId: string): Promise<ApiKeyResponseDto[]> {
    const keys = await this.repo.findByWorkspace(workspaceId);
    return keys.map((k) => this.mapToDto(k));
  }

  async revoke(workspaceId: string, id: string): Promise<void> {
    const apiKey = await this.repo.findByIdWithTenant(workspaceId, id);
    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }

    await withTransaction(async (tx) => {
      await this.repo.revoke(id, workspaceId, tx as any);

      await tx
        .insert(schema.outbox)
        .values({
          eventType: 'api_key.revoked',
          payload: { apiKeyId: id, workspaceId },
        });
    });

    // IMMEDIATELY invalidate Redis cache (Logic Check requirement)
    const cacheKey = `api-key:${apiKey.keyHash}`;
    await this.cache.del(cacheKey);
  }

  private mapToDto(apiKey: any): ApiKeyResponseDto {
    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPreview: apiKey.keyPreview,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }
}
