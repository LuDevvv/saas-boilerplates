import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerRequest } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration } = requestProps;
    
    const response = context.switchToHttp().getResponse();
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id || req.ip;
    
    const key = this.generateKey(context, userId, throttler.name || "default");
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
        tracker: userId,
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire
      });
    }
    
    return true;
  }
}
