import { Module } from "@nestjs/common";
import { createStorageProvider } from "@node-stack/storage";

import { AnalyticsModule } from "@/analytics/analytics.module.js";
import { IdempotencyService } from "@/common/services/idempotency.service.js";
import { StorageController } from "@/storage/storage.controller.js";
import { AppStorageService } from "@/storage/storage.service.js";

/**
 * Returns undefined for unset values OR un-replaced .env.example placeholders
 * (anything containing <...>), allowing the caller to fall back to the next option.
 */
function stripPlaceholder(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed && !/<[^>]+>/.test(trimmed) ? trimmed : undefined;
}

/**
 * Ensures a storage endpoint has a valid http/https scheme.
 * Throws a descriptive error at startup rather than letting the AWS SDK
 * throw a cryptic TypeError at request time.
 */
function normalizeEndpoint(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const normalized = /^https?:\/\//i.test(value) ? value : `http://${value}`;

  try {
    new URL(normalized);
  } catch {
    throw new Error(
      `[StorageModule] Invalid storage endpoint "${value}". ` +
      `Use a full URL, e.g. "http://minio:9000" (Docker) or "http://localhost:9000" (local).`,
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
          // stripPlaceholder() skips un-replaced .env.example values like
          // <tu-account-id> so they fall through to the MINIO_* fallback.
          return createStorageProvider({
            provider: "s3",
            s3: {
              endpoint: normalizeEndpoint(
                stripPlaceholder(process.env.STORAGE_S3_ENDPOINT) ||
                stripPlaceholder(process.env.MINIO_ENDPOINT),
              ),
              region: process.env.STORAGE_S3_REGION || "auto",
              accessKeyId:
                stripPlaceholder(process.env.STORAGE_S3_ACCESS_KEY) ||
                process.env.MINIO_ACCESS_KEY || "",
              secretAccessKey:
                stripPlaceholder(process.env.STORAGE_S3_SECRET_KEY) ||
                process.env.MINIO_SECRET_KEY || "",
              bucket:
                stripPlaceholder(process.env.STORAGE_S3_BUCKET) ||
                process.env.MINIO_BUCKET || "attachments",
              publicUrl:
                stripPlaceholder(process.env.STORAGE_S3_PUBLIC_URL) ||
                process.env.MINIO_PUBLIC_URL,
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
