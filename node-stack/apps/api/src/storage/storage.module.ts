import { Module } from "@nestjs/common";
import { createStorageService } from "@node-stack/storage";

import { StorageController } from "./storage.controller";
import { AppStorageService } from "./storage.service";
import { IdempotencyService } from "../common/services/idempotency.service";

@Module({
  controllers: [StorageController],
  providers: [
    AppStorageService,
    IdempotencyService,
    {
      provide: "STORAGE_SERVICE",
      useFactory: () => {
        const provider = (
          process.env.STORAGE_PROVIDER || "minio"
        ).toLowerCase();
        const endpoint =
          provider === "minio"
            ? process.env.MINIO_ENDPOINT
            : process.env.R2_ENDPOINT;
        const bucket =
          process.env.MINIO_BUCKET || process.env.R2_BUCKET || "attachments";
        const publicUrl =
          process.env.MINIO_PUBLIC_URL || process.env.R2_PUBLIC_URL;
        const accessKey =
          process.env.MINIO_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID || "";
        const secret =
          process.env.MINIO_SECRET_KEY ||
          process.env.R2_SECRET_ACCESS_KEY ||
          "";
        return createStorageService({
          endpoint,
          bucket,
          publicUrl,
          accessKeyId: accessKey,
          secretAccessKey: secret,
        });
      },
    },
  ],
  exports: ["STORAGE_SERVICE"],
})
export class StorageModule {}
