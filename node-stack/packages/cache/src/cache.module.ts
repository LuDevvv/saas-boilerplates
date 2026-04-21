import { Module, Global } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CacheService } from "./cache.service.js";
import { RateLimiterService } from "./rate-limiter.js";
import { RateLimitGuard } from "./rate-limit.guard.js";

@Global()
@Module({
  providers: [
    CacheService,
    RateLimiterService,
    Reflector,
  ],
  exports: [
    CacheService,
    RateLimiterService,
    Reflector,
  ],
})
export class CacheModule {}
