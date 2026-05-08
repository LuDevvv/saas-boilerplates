import { Module, Global } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { CacheService } from "./cache.service.js";
import { RateLimitGuard } from "./rate-limit.guard.js";
import { RateLimiterService } from "./rate-limiter.js";

@Global()
@Module({
  providers: [
    CacheService,
    RateLimiterService,
    RateLimitGuard,
    Reflector,
  ],
  exports: [
    CacheService,
    RateLimiterService,
    RateLimitGuard,
    Reflector,
  ],
})
export class CacheModule {}
