import { Injectable, ExecutionContext, Inject } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerRequest } from "@nestjs/throttler";
import { CacheService } from "@node-stack/cache";
import { db, schema, eq } from "@node-stack/db";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  @Inject(CacheService)
  private readonly cacheService!: CacheService;

  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit: defaultLimit, ttl: defaultTtl, throttler, blockDuration } = requestProps;
    
    const response = context.switchToHttp().getResponse();
    const req = context.switchToHttp().getRequest();
    
    let userId = req.user?.id || req.ip;
    let identityType = 'public';

    if (req.apiKey) {
      identityType = 'api-key';
      userId = req.apiKey.id;
    } else if (req.user) {
      identityType = 'jwt';
    }

    let limit = defaultLimit;
    let ttl = defaultTtl;

    const workspaceId = req.workspace?.id;
    if (workspaceId) {
      const tier = await this.cacheService.getOrSet(
        `ws:${workspaceId}:tier`,
        async () => {
          const result = await db.query.workspaces.findFirst({
            where: eq(schema.workspaces.id, workspaceId),
            columns: { tier: true },
          });
          return result?.tier || 'free';
        },
        86400, // 24 hours caching
      );

      if (tier === 'enterprise') {
        return true; // Skip throttling
      } else if (tier === 'pro') {
        limit = 1000;
        ttl = 60000; // 1 min
      } else {
        limit = 100;
        ttl = 60000; // 1 min
      }
    } else {
      // Identity based limits when no workspace context is present
      if (identityType === 'public') {
        limit = 20;
        ttl = 60000;
      } else if (identityType === 'jwt') {
        limit = 100;
        ttl = 60000;
      } else if (identityType === 'api-key') {
        limit = 500;
        ttl = 60000;
      }
    }

    const tracker = workspaceId ? `tenant:${workspaceId}:${userId}` : `identity:${userId}`;
    const key = this.generateKey(context, tracker, throttler.name || "default");
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } = await this.storageService.increment(key, ttl, limit, blockDuration, throttler.name || "default");
    
    response.setHeader("X-RateLimit-Limit", limit);
    response.setHeader("X-RateLimit-Remaining", Math.max(0, limit - totalHits));
    response.setHeader("X-RateLimit-Reset", new Date(Date.now() + ttl).toISOString());
    
    if (totalHits > limit) {
      response.setHeader("Retry-After", Math.ceil(ttl / 1000));
      await this.throwThrottlingException(context, {
        limit,
        ttl,
        key,
        tracker,
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire
      });
    }
    
    return true;
  }
}
