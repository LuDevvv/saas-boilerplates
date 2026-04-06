import { Module, Global } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CacheService } from "./cache.service";
import { RateLimiterService } from "./rate-limiter";
import { RateLimitGuard } from "./rate-limit.guard";

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
