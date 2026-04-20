import { Injectable, Optional } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class CacheService {
  private client: Redis;
  private namespace: string;
  private ttlDefault: number;

  constructor(
    @Optional() namespace: string = "default",
    @Optional() ttlDefault: number = 300,
  ) {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    const prefix = process.env.REDIS_PREFIX || "";
    this.namespace = prefix ? `${prefix}:${namespace}` : namespace;
    this.ttlDefault = ttlDefault;
    this.client = new Redis(url);
  }

  private key(key: string, tenantId?: string): string {
    const parts = ["cache", this.namespace];
    if (tenantId) parts.push(tenantId);
    parts.push(key);
    return parts.join(":");
  }

  async set(
    key: string,
    value: unknown,
    ttl?: number,
    tenantId?: string,
  ): Promise<void> {
    const v = JSON.stringify(value);
    const ex = ttl ?? this.ttlDefault;
    await this.client.set(this.key(key, tenantId), v, "EX", ex);
  }

  async get<T = unknown>(key: string, tenantId?: string): Promise<T | null> {
    const raw = await this.client.get(this.key(key, tenantId));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async del(key: string, tenantId?: string): Promise<void> {
    await this.client.del(this.key(key, tenantId));
  }


  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
    tenantId?: string,
  ): Promise<T> {
    const cached = await this.get<T>(key, tenantId);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttl, tenantId);
    return value;
  }

  async invalidate(pattern: string, tenantId?: string): Promise<void> {
    const fullPattern = this.key(pattern, tenantId);
    let cursor = "0";
    const toDelete: string[] = [];
    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        "MATCH",
        fullPattern,
        "COUNT",
        "1000",
      );
      cursor = nextCursor;
      if (keys.length) toDelete.push(...keys);
    } while (cursor !== "0");
    if (toDelete.length) {
      // Redis DEL supports multiple keys
      await this.client.del(...toDelete);
    }
  }
  async publish(channel: string, message: any): Promise<void> {
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    const prefixedChannel = this.namespace ? `${this.namespace}:${channel}` : channel;
    await this.client.publish(prefixedChannel, data);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subClient = this.client.duplicate();
    const prefixedChannel = this.namespace ? `${this.namespace}:${channel}` : channel;
    await subClient.subscribe(prefixedChannel);
    subClient.on('message', (ch, msg) => {
      if (ch === prefixedChannel) {
        callback(msg);
      }
    });
  }

  async psubscribe(pattern: string, callback: (channel: string, message: string) => void): Promise<void> {
    const subClient = this.client.duplicate();
    const prefixedPattern = this.namespace ? `${this.namespace}:${pattern}` : pattern;
    await subClient.psubscribe(prefixedPattern);
    subClient.on('pmessage', (p, ch, msg) => {
      if (p === prefixedPattern) {
        callback(ch, msg);
      }
    });
  }
}
