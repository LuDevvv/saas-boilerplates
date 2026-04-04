import { Redis } from "ioredis";

export class RateLimiterService {
  private client: Redis;

  constructor(private readonly redisUrl?: string) {
    this.redisUrl =
      this.redisUrl ?? process.env.REDIS_URL ?? "redis://localhost:6379";
    this.client = new Redis(this.redisUrl);
  }

  // Check current rate limit window and return a detailed result
  async check(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<{ count: number; resetAt: number; allowed: boolean }> {
    const fullKey = `rate:${key}`;
    const now = Date.now();
    const resetAt = now + windowMs;

    const count = await this.client.incr(fullKey);
    if (count === 1) {
      // Initialize TTL in milliseconds
      await this.client.pexpire(fullKey, windowMs);
    }

    // Retrieve remaining TTL in ms to compute a precise reset time
    const ttl = await this.client.pttl(fullKey);
    const actualResetAt = ttl > 0 ? now + ttl : resetAt;

    return {
      count,
      resetAt: actualResetAt,
      allowed: count <= limit,
    };
  }

  // Backwards-compatible helper (not used by new flow but kept for safety)
  async isAllowed(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    const res = await this.check(key, limit, windowMs);
    return res.allowed;
  }
  async invalidate(key: string): Promise<void> {
    await this.client.del(key);
  }
}
