import { Module } from "@nestjs/common";
import { createStorageProvider } from "@node-stack/storage";

import { AnalyticsModule } from "@/analytics/analytics.module.js";
import { IdempotencyService } from "@/common/services/idempotency.service.js";
import { StorageController } from "@/storage/storage.controller.js";
import { AppStorageService } from "@/storage/storage.service.js";
import { ThumbnailService } from "@/storage/thumbnail.service.js";

/** Returns undefined for unset or un-replaced .env.example placeholders (<...>). */
function env(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const t = value.trim();
  return t && !/<[^>]+>/.test(t) ? t : undefined;
}

/** Validates that an endpoint is a full URL; throws a startup error otherwise. */
function requireValidEndpoint(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = /^https?:\/\//i.test(value) ? value : `http://${value}`;
  try {
    new URL(normalized);
  } catch {
    throw new Error(
      `[StorageModule] Invalid storage endpoint "${value}". ` +
      `Set STORAGE_S3_ENDPOINT to a full URL like "https://<id>.r2.cloudflarestorage.com".`,
    );
  }
  return normalized;
}

@Module({
  imports: [AnalyticsModule],

  controllers: [StorageController],
  providers: [
    AppStorageService,
    ThumbnailService,
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
              endpoint: requireValidEndpoint(env(process.env.STORAGE_S3_ENDPOINT)),
              region: process.env.STORAGE_S3_REGION || "auto",
              accessKeyId: env(process.env.STORAGE_S3_ACCESS_KEY) || "",
              secretAccessKey: env(process.env.STORAGE_S3_SECRET_KEY) || "",
              bucket: env(process.env.STORAGE_S3_BUCKET) || "app",
              publicUrl: env(process.env.STORAGE_S3_PUBLIC_URL),
            },
          });
        }

        return createStorageProvider({
          provider: "local",
          local: {
            basePath: process.env.STORAGE_LOCAL_PATH || "./uploads",
            baseUrl:
              process.env.STORAGE_LOCAL_URL ||
              "http://localhost:4000/api/v1/storage",
          },
        });
      },
    },
  ],
  exports: ["STORAGE_SERVICE", ThumbnailService],
})
export class StorageModule {}
