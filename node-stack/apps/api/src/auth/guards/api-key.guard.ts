import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyRepository, WorkspaceRepository, hashKey } from '@node-stack/db';
import { CacheService } from '@node-stack/cache';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyRepo: ApiKeyRepository,
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawKey = request.headers['x-api-key'] as string;

    if (!rawKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const hashedKey = hashKey(rawKey);

    // 1. Check Redis Cache (5-minute TTL)
    const cacheKey = `api-key:${hashedKey}`;
    let apiKey = await this.cacheService.get<any>(cacheKey);

    if (!apiKey) {
      // 2. Database Lookup
      apiKey = await this.apiKeyRepo.findByKeyHash(hashedKey);
      if (apiKey) {
        // save to cache for 5 minutes (300 seconds)
        await this.cacheService.set(cacheKey, apiKey, 300);
      }
    }

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // 3. Validation: Expiration check
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // 4. Validation: Active Workspace Check
    const workspace = await this.workspaceRepo.findById(apiKey.workspaceId);
    if (!workspace) {
      throw new UnauthorizedException('Associated workspace not found or inactive');
    }

    // 5. Populate context for compatibility (RolesGuard, TenantId, etc.)
    // request.user for RolesGuard compatibility
    request.user = {
      id: apiKey.userId,
      workspaceId: apiKey.workspaceId,
      workspaceRole: 'admin', // API keys usually have admin-level scoped access
      isApiKey: true,
    };

    // request.workspace for WorkspaceContext compatibility
    request.workspace = {
      workspaceId: apiKey.workspaceId,
      role: 'admin',
    };

    // 6. Track activity (async, non-blocking)
    void this.apiKeyRepo.updateLastUsed(apiKey.id);

    return true;
  }
}
