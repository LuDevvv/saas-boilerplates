import { Injectable, Inject } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";
import type { IStorageProvider } from "@node-stack/storage";

@Injectable()
export class StorageHealthIndicator extends HealthIndicator {
  constructor(
    @Inject("STORAGE_SERVICE")
    private readonly storage: IStorageProvider,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.storage.ping();
      if (isHealthy) {
        return this.getStatus(key, true);
      }
      throw new Error("Storage ping failed");
    } catch (error) {
      throw new HealthCheckError(
        "Storage check failed",
        this.getStatus(key, false, { message: (error as Error).message }),
      );
    }
  }
}
