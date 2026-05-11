import { Module } from "@nestjs/common";
import { createStorageProvider } from "@node-stack/storage";

import { AnalyticsModule } from "@/analytics/analytics.module.js";
import { IdempotencyService } from "@/common/services/idempotency.service.js";
import { StorageController } from "@/storage/storage.controller.js";
import { AppStorageService } from "@/storage/storage.service.js";

/**
 * Normalizes an endpoint string to have an http/https scheme.
 * MINIO_ENDPOINT=localhost:9000 → http://localhost:9000
 * Throws a clear error at startup if the value is still not a valid URL.
 */
function normalizeEndpoint(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

  try {
    new URL(normalized);
  } catch {
    throw new Error(
      `[StorageModule] Invalid endpoint "${value}" (normalized to "${normalized}"). ` +
      `Set MINIO_ENDPOINT or STORAGE_S3_ENDPOINT to a full URL, e.g. "http://minio:9000" ` +
      `(Docker) or "http://localhost:9000" (local).`,
    );
  }

  return normalized;
}

@Module({
  imports: [AnalyticsModule],

  controllers: [StorageController],
  providers: [
    AppStorageService,
    IdempotencyService,
    {
      provide: "STORAGE_PROVIDER_TYPE",
      useFactory: () =>
        (process.env.STORAGE_PROVIDER || "local").toLowerCase() as "s3" | "local",
    },
    {
      provide: "STORAGE_SERVICE",
      useFactory: () => {
        const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase() as "s3" | "local";

        if (provider === "s3") {
          return createStorageProvider({
            provider: "s3",
            s3: {
              endpoint: normalizeEndpoint(process.env.STORAGE_S3_ENDPOINT || process.env.MINIO_ENDPOINT),
              region: process.env.STORAGE_S3_REGION || "us-east-1",
              accessKeyId: process.env.STORAGE_S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || "",
              secretAccessKey: process.env.STORAGE_S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || "",
              bucket: process.env.STORAGE_S3_BUCKET || process.env.MINIO_BUCKET || "attachments",
              publicUrl: process.env.STORAGE_S3_PUBLIC_URL || process.env.MINIO_PUBLIC_URL,
            },
          });
        }

        return createStorageProvider({
          provider: "local",
          local: {
            basePath: process.env.STORAGE_LOCAL_PATH || "./storage",
            baseUrl:
              process.env.STORAGE_LOCAL_URL ||
              "http://localhost:4000/api/v1/storage",
          },
        });
      },
    },
  ],
  exports: ["STORAGE_SERVICE"],
})
export class StorageModule {}
