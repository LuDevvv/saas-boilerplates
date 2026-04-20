import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiKeyRepository } from '@node-stack/db';
import { verifyApiKey, extractPrefix } from '@node-stack/db';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(
    private readonly apiKeyRepo: ApiKeyRepository,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const rawKey = (req.headers['x-api-key'] as string) || '';
    if (!rawKey) throw new UnauthorizedException('API key required');

    const prefix = extractPrefix(rawKey);
    const record = await this.apiKeyRepo.findByPrefix(prefix);
    if (!record) throw new UnauthorizedException('Invalid API key');

    if (record.expiresAt && record.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    const pepper = this.config.getOrThrow<string>('API_KEY_PEPPER');
    const valid = verifyApiKey(rawKey, record.keyHash, pepper);
    if (!valid) throw new UnauthorizedException('Invalid API key');

    void this.apiKeyRepo.updateLastUsed(record.id);

    return {
      apiKeyId: record.id,
      workspaceId: record.workspaceId,
      userId: record.userId,
      scopes: record.scopes as string[],
    };
  }
}
