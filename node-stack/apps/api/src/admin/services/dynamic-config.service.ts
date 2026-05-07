import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CacheService } from "@node-stack/cache";
import { SystemConfigRepository } from "@node-stack/db";

@Injectable()
export class DynamicConfigService implements OnModuleInit {
  private readonly logger = new Logger(DynamicConfigService.name);
  private readonly CACHE_KEY = "system:config";
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private systemConfigRepository: SystemConfigRepository,
    private cacheService: CacheService,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.warmCache();
  }

  /**
   * Warms up the cache with current system configuration.
   */
  async warmCache() {
    try {
      const config = await this.systemConfigRepository.all();
      const configMap = config.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>);

      await this.cacheService.set(this.CACHE_KEY, configMap, this.CACHE_TTL);
      this.logger.log("System configuration cache warmed up");
    } catch (error) {
      this.logger.error("Failed to warm system config cache", error);
    }
  }

  /**
   * Retrieves a configuration value by key.
   * Checks cache first, then DB (via getOrSet logic).
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    const cachedMap = await this.cacheService.get<Record<string, any>>(this.CACHE_KEY);
    
    if (cachedMap && cachedMap[key] !== undefined) {
      return cachedMap[key] as T;
    }

    // Fallback to DB for specific key if map is missing or key is not in map
    const dbConfig = await this.systemConfigRepository.get(key);
    const value = dbConfig ? (dbConfig.value as T) : (defaultValue as T);

    // If map existed, update it with this new value to avoid future DB hits
    if (cachedMap && dbConfig) {
      cachedMap[key] = dbConfig.value;
      await this.cacheService.set(this.CACHE_KEY, cachedMap, this.CACHE_TTL);
    }

    return value;
  }

  /**
   * Updates or creates a configuration value.
   * Invalidates cache and logs an audit event.
   */
  async set(key: string, value: any, description?: string, adminId?: string) {
    const oldValue = await this.get(key);

    await this.systemConfigRepository.set(key, value);

    // Invalidate full config cache to ensure consistency
    await this.cacheService.del(this.CACHE_KEY);
    this.logger.log(`Configuration updated: ${key}`);

    // Audit the change
    this.eventEmitter.emit("audit.log", {
      action: "system.config_updated",
      userId: adminId,
      entityType: "system_config",
      entityId: key,
      metadata: {
        key,
        oldValue,
        newValue: value,
        description,
      },
    });
  }

  /**
   * Gets all configuration keys and values.
   */
  async getAll() {
    return this.systemConfigRepository.all();
  }
}
