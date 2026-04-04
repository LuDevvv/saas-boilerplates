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
}
