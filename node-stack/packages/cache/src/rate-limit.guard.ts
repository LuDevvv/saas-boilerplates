import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { RateLimitOptions, RateLimit } from "./rate-limit.decorator";
import { RateLimiterService } from "./rate-limiter";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly limiter: RateLimiterService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const opts =
      this.reflector.get<RateLimitOptions>("cache:rate-limit", handler) ??
      undefined;
    if (!opts) return true;

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const route = req?.route?.path ?? req?.path ?? "/";
    let keyBase = `${req?.method ?? "GET"}:${route}`;
    if (opts.key === "user") {
      const id = req?.user?.id ?? req?.ip ?? "anonymous";
      keyBase = `${keyBase}:user:${id}`;
    } else if (opts.key === "ip") {
      keyBase = `${keyBase}:ip:${req?.ip}`;
    }
    const result = await this.limiter.check(keyBase, opts.max, opts.windowMs);

    // Expose rate limit headers on every response
    try {
      res.setHeader("X-RateLimit-Limit", opts.max);
      const remaining = Math.max(
        0,
        result.count > opts.max ? 0 : opts.max - result.count,
      );
      res.setHeader("X-RateLimit-Remaining", remaining);
      // reset timestamp is in epoch seconds in header per example; convert ms to seconds
      res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));
    } catch {
      // If headers cannot be set for any reason, fail silently
    }

    if (!result.allowed) {
      // If over the limit, tell client when to retry
      res.setHeader("Retry-After", Math.ceil(opts.windowMs / 1000));
      throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
