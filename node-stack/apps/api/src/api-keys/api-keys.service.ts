import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { CacheService } from '@node-stack/cache';
import {
  ApiKeyRepository,
  AuditLogRepository,
  withTenantTx,
  schema,
  generateApiKey,
  hashKey,
  getKeyPreview,
  extractPrefix,
  verifyApiKey,
  DB_TOKEN,
} from '@node-stack/db';
import type { Database } from '@node-stack/db';
import { CreateApiKeyDto } from '@node-stack/validators';

import {
  ApiKeyResponseDto,
  CreateApiKeyResponseDto,
} from '@/workspaces/dto/api-key.dto.js';


@Injectable()
export class ApiKeysService {
  private readonly pepper: string;

  constructor(
    private readonly repo: ApiKeyRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {
    this.pepper = this.config.getOrThrow<string>('API_KEY_PEPPER');
  }

  async create(
    workspaceId: string,
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<CreateApiKeyResponseDto> {
    const plainKey = generateApiKey();
    const keyHash = hashKey(plainKey, this.pepper);
    const keyPreview = getKeyPreview(plainKey);
    const prefix = extractPrefix(plainKey);
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    let outboxEventId: string | null = null;
    const record = await withTenantTx(workspaceId, async (tx) => {
      const key = await this.repo.create({
        workspaceId,
        userId,
        name: dto.name,
        keyHash,
        keyPreview,
        prefix,
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

      await this.auditLog.create(
        {
          workspaceId,
          userId,
          action: 'auth.api_key_created',
          entityType: 'api_key',
          entityId: key.id,
          metadata: { name: key.name, prefix: key.prefix },
        },
        tx as any,
      );

      return key;
    }, this.db);

    return {
      ...this.mapToDto(record),
      plainKey: plainKey, // ONLY RETURNED ONCE!
    };
  }

  /**
   * High-performance validation with caching and timing-safe checks
   */
  async validateKey(rawKey: string): Promise<any> {
    const prefix = extractPrefix(rawKey);
    const tempHash = hashKey(rawKey, this.pepper); // For cache key
    const cacheKey = `api-key:v1:${tempHash}`;

    // 1. L1 Cache lookup
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    // 2. DB lookup by prefix (indexed)
    const apiKey = await this.repo.findByPrefix(prefix);
    if (!apiKey) return null;

    // 3. Timing-safe verification
    const isValid = verifyApiKey(rawKey, apiKey.keyHash, this.pepper);
    if (!isValid) return null;

    // 4. Expiration check
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null;
    }

    // 5. Populate cache (5 mins)
    await this.cache.set(cacheKey, apiKey, 300);

    return apiKey;
  }

  @OnEvent('api_key.used')
  async handleUsage(apiKeyId: string) {
    // Non-blocking background update
    await this.repo.updateLastUsed(apiKeyId);
  }

  async list(workspaceId: string): Promise<ApiKeyResponseDto[]> {
    const keys = await this.repo.findByWorkspace(workspaceId);
    return keys.map((k) => this.mapToDto(k));
  }

  async revoke(
    workspaceId: string,
    id: string,
    actorUserId: string | null = null,
  ): Promise<void> {
    const apiKey = await this.repo.findByIdWithTenant(workspaceId, id);
    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }

    await withTenantTx(workspaceId, async (tx) => {
      await this.repo.revoke(id, workspaceId, tx as any);

      await tx
        .insert(schema.outbox)
        .values({
          eventType: 'api_key.revoked',
          payload: { apiKeyId: id, workspaceId },
        });

      await this.auditLog.create(
        {
          workspaceId,
          userId: actorUserId,
          action: 'auth.api_key_revoked',
          entityType: 'api_key',
          entityId: id,
          metadata: { name: apiKey.name, prefix: apiKey.prefix },
        },
        tx as any,
      );
    }, this.db);

    // IMMEDIATELY invalidate Redis cache
    // Note: We need to invalidate ALL possible hashes if we used salt/pepper, 
    // but since we search by prefix, we can just let it expire or if we have the hash in apiKey, use it.
    const cacheKey = `api-key:v1:${apiKey.keyHash}`;
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
