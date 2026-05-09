import { SetMetadata } from "@nestjs/common";

export const CACHE_INVALIDATE_KEY = "cache_invalidate";
export const CacheInvalidate = (patterns: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(CACHE_INVALIDATE_KEY, patterns);
