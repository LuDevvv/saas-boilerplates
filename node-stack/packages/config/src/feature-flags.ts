import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class FeatureFlagService {
  private redis: Redis;
  private prefix = "feature:flag";

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  }

  async isEnabled(
    flagKey: string,
    workspaceId?: string,
    userId?: string,
  ): Promise<boolean> {
    // Workspace-specific flag
    if (workspaceId) {
      const wsFlag = await this.redis.get(
        `${this.prefix}:${flagKey}:ws:${workspaceId}`,
      );
      if (wsFlag !== null) return wsFlag === "true";
    }

    // User-specific flag
    if (userId) {
      const userFlag = await this.redis.get(
        `${this.prefix}:${flagKey}:user:${userId}`,
      );
      if (userFlag !== null) return userFlag === "true";
    }

    // Global flag
    const globalFlag = await this.redis.get(`${this.prefix}:${flagKey}:global`);
    return globalFlag === "true";
  }

  async enable(
    flagKey: string,
    scope: "global" | "workspace" | "user",
    id?: string,
  ): Promise<void> {
    const key = id
      ? `${this.prefix}:${flagKey}:${scope}:${id}`
      : `${this.prefix}:${flagKey}:${scope}`;
    await this.redis.set(key, "true");
  }

  async disable(
    flagKey: string,
    scope: "global" | "workspace" | "user",
    id?: string,
  ): Promise<void> {
    const key = id
      ? `${this.prefix}:${flagKey}:${scope}:${id}`
      : `${this.prefix}:${flagKey}:${scope}`;
    await this.redis.del(key);
  }

  async listAll(): Promise<Array<{ key: string; scope: string; scopeId: string | null; enabled: boolean }>> {
    const pattern = `${this.prefix}:*`;
    const keys = await this.redis.keys(pattern);
    const results = await Promise.all(
      keys.map(async (redisKey): Promise<{ key: string; scope: string; scopeId: string | null; enabled: boolean }> => {
        const value = await this.redis.get(redisKey);
        // Key format: feature:flag:<flagKey>:<scope>[:<id>]
        const withoutPrefix = redisKey.slice(this.prefix.length + 1);
        const parts = withoutPrefix.split(":");
        const flagKey = parts[0] ?? "";
        const scope = parts[1] ?? "global";
        const scopeId = parts[2] ?? null;
        return { key: flagKey, scope, scopeId, enabled: value === "true" };
      }),
    );
    return results;
  }
}
