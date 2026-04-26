import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ApiKeysService } from '@/api-keys/api-keys.service.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawKey = request.headers['x-api-key'] as string;

    if (!rawKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const apiKey = await this.apiKeysService.validateKey(rawKey);

    if (!apiKey) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    // Populate context for compatibility
    request.user = {
      id: apiKey.userId,
      workspaceId: apiKey.workspaceId,
      workspaceRole: 'admin',
      isApiKey: true,
    };

    request.workspace = {
      workspaceId: apiKey.workspaceId,
      role: 'admin',
    };

    // Track activity via event
    this.eventEmitter.emit('api_key.used', apiKey.id);

    return true;
  }
}
