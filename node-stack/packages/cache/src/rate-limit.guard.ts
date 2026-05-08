import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { RateLimitOptions } from "./rate-limit.decorator.js";
import { RateLimiterService } from "./rate-limiter.js";

interface RateLimitedRequest {
  method?: string;
  ip?: string;
  path?: string;
  route?: { path?: string };
  user?: { id?: string };
}

interface RateLimitedResponse {
  setHeader(name: string, value: string | number): void;
}

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

    const req = context.switchToHttp().getRequest<RateLimitedRequest>();
    const res = context.switchToHttp().getResponse<RateLimitedResponse>();
    const route = req?.route?.path ?? req?.path ?? "/";
    let keyBase = `${req?.method ?? "GET"}:${route}`;
    if (opts.key === "user") {
      const id = req?.user?.id ?? req?.ip ?? "anonymous";
      keyBase = `${keyBase}:user:${id}`;
    } else if (opts.key === "ip") {
      keyBase = `${keyBase}:ip:${req?.ip ?? "anonymous"}`;
    }
    const result = await this.limiter.check(keyBase, opts.max, opts.windowMs);

    try {
      res.setHeader("X-RateLimit-Limit", opts.max);
      const remaining = Math.max(
        0,
        result.count > opts.max ? 0 : opts.max - result.count,
      );
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));
    } catch {
      // If headers cannot be set for any reason, fail silently
    }

    if (!result.allowed) {
      res.setHeader("Retry-After", Math.ceil(opts.windowMs / 1000));
      throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
