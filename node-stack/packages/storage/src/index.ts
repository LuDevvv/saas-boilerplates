import { IStorageProvider } from "./interface.js";
import { LocalStorageProvider, LocalStorageConfig } from "./providers/local.js";
import { S3StorageProvider } from "./providers/s3.js";

export * from "./interface.js";
export { S3StorageProvider } from "./providers/s3.js";
export { LocalStorageProvider } from "./providers/local.js";
export {
  MAGIC_BYTES_PROBE_SIZE,
  verifyMagicBytes,
} from "./magic-bytes.js";
export type { MagicByteVerdict } from "./magic-bytes.js";

export interface UnifiedStorageConfig {
  provider: "s3" | "local";
  s3?: {
    endpoint?: string;
    /** Public-facing endpoint used for presigned URL generation. */
    publicEndpoint?: string;
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
