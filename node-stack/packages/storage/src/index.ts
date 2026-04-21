import { S3StorageProvider } from "./providers/s3.js";
import { LocalStorageProvider, LocalStorageConfig } from "./providers/local.js";
import { IStorageProvider } from "./interface.js";

export * from "./interface.js";
export { S3StorageProvider } from "./providers/s3.js";
export { LocalStorageProvider } from "./providers/local.js";

export interface UnifiedStorageConfig {
  provider: "s3" | "local";
  s3?: {
    endpoint?: string;
    region?: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl?: string;
  };
  local?: LocalStorageConfig;
}

export const createStorageProvider = (config: UnifiedStorageConfig): IStorageProvider => {
  if (config.provider === "s3" && config.s3) {
    return new S3StorageProvider(config.s3);
  }

  if (config.provider === "local" && config.local) {
    return new LocalStorageProvider(config.local);
  }

  throw new Error(`Unsupported storage provider or missing configuration for ${config.provider}`);
};
