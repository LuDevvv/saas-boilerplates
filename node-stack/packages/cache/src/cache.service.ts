import { Injectable, Optional, OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";
import { recordCacheHit, recordCacheMiss } from "@node-stack/utils";

@Injectable()
export class CacheService implements OnModuleDestroy {
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
    this.client = new Redis(url, {
      maxRetriesPerRequest: null,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
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
    if (raw === null) {
      recordCacheMiss();
      return null;
    }
    recordCacheHit();
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
  async publish(channel: string, message: unknown): Promise<void> {
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

  async ping(): Promise<string> {
    return await this.client.ping();
  }

  /**
   * Atomic SET key token NX EX ttl. Returns the token on acquisition,
   * null if the lock is already held by another instance. Use with
   * releaseLock to ensure only the holder removes the key. Used by
   * MaintenanceService to dedupe cron work across replicas.
   */
  async tryAcquireLock(
    key: string,
    ttlSeconds: number,
    token: string,
  ): Promise<string | null> {
    const result = await this.client.set(
      this.key(key),
      token,
      "EX",
      ttlSeconds,
      "NX",
    );
    return result === "OK" ? token : null;
  }

  /**
   * Conditional release: only delete the key if its current value
   * matches the provided token, so a slow-running holder cannot
   * accidentally delete a successor's lock after its lease has
   * expired and another instance has taken over.
   */
  async releaseLock(key: string, token: string): Promise<void> {
    const lua =
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
    await this.client.eval(lua, 1, this.key(key), token);
  }
}
