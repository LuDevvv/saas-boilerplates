import { Module, Global } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { RateLimiterService } from "./rate-limiter";
import { RateLimitGuard } from "./rate-limit.guard";

@Global()
@Module({
  providers: [
    CacheService,
    RateLimiterService,
    RateLimitGuard,
  ],
  exports: [
    CacheService,
    RateLimiterService,
    RateLimitGuard,
  ],
})
export class CacheModule {}
