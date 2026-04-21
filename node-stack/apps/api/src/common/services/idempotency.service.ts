import { Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";

const IDEMPOTENCY_PREFIX = "idempotency:";
const LOCK_PREFIX = "idempotency:lock:";
const TTL_SECONDS = 86400; // 24 hours
const LOCK_TTL_SECONDS = 300; // 5 minutes lock expiry

interface CachedResponse {
  statusCode: number;
  data: any;
}

@Injectable()
export class IdempotencyService {
  private readonly client: Redis;
  private readonly logger = new Logger(IdempotencyService.name);

  constructor() {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    this.client = new Redis(url);
  }

  async get(key: string): Promise<CachedResponse | null> {
    const raw = await this.client.get(`${IDEMPOTENCY_PREFIX}${key}`);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as CachedResponse;
    } catch {
      return null;
    }
  }

  async set(key: string, data: CachedResponse): Promise<void> {
    await this.client.set(
      `${IDEMPOTENCY_PREFIX}${key}`,
      JSON.stringify(data),
      "EX",
      TTL_SECONDS,
    );
  }

  async setWithLock(key: string): Promise<boolean> {
    const result = await this.client.set(
      `${LOCK_PREFIX}${key}`,
      "1",
      "EX",
      LOCK_TTL_SECONDS,
      "NX",
    );
    return result === "OK";
  }

  async releaseLock(key: string): Promise<void> {
    await this.client.del(`${LOCK_PREFIX}${key}`);
  }
}
