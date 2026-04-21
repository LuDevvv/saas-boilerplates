import { Module } from "@nestjs/common";
import { createStorageProvider } from "@node-stack/storage";

import { StorageController } from "./storage.controller.js";
import { AppStorageService } from "./storage.service.js";
import { IdempotencyService } from "../common/services/idempotency.service.js";
import { AnalyticsModule } from "../analytics/analytics.module.js";

@Module({
  imports: [AnalyticsModule],

  controllers: [StorageController],
  providers: [
    AppStorageService,
    IdempotencyService,
    {
      provide: "STORAGE_SERVICE",
      useFactory: () => {
        const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase() as "s3" | "local";
        
        if (provider === "s3") {
          return createStorageProvider({
            provider: "s3",
            s3: {
              endpoint: process.env.STORAGE_S3_ENDPOINT || process.env.MINIO_ENDPOINT,
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
            baseUrl: process.env.STORAGE_LOCAL_URL || "http://localhost:3000/api/storage",
          },
        });
      },
    },
  ],
  exports: ["STORAGE_SERVICE"],
})
export class StorageModule {}
