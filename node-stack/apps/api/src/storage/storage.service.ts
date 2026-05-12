import { randomUUID } from "crypto";

import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  UnsupportedMediaTypeException,
  Logger,
} from "@nestjs/common";
import {
  AuditLogRepository,
  DB_TOKEN,
  FileRepository,
  withTenantTx,
} from "@node-stack/db";
import type { Database, File } from "@node-stack/db";
import {
  MAGIC_BYTES_PROBE_SIZE,
  verifyMagicBytes,
} from "@node-stack/storage";
import type { FileMetadata, IStorageProvider } from "@node-stack/storage";
import type { FileInfo } from "@node-stack/types";
import {
  GetPresignedUrlDto,
  UPLOAD_POLICIES,
  getFileExtension,
  sanitizeFilename,
} from "@node-stack/validators";
import type { UploadContext } from "@node-stack/validators";

import { UsageQuotaService } from "@/analytics/usage-quota.service.js";

@Injectable()
export class AppStorageService {
  private readonly logger = new Logger(AppStorageService.name);

  constructor(
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
    @Inject("STORAGE_PROVIDER_TYPE") private readonly providerType: "s3" | "local",
    private readonly fileRepo: FileRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly usageQuotaService: UsageQuotaService,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  async getPresignedUploadUrl(
    dto: GetPresignedUrlDto,
    workspaceId: string,
    userId: string,
  ): Promise<{ url: string; key: string; expiresAt: Date; fileId: string }> {
    await this.usageQuotaService.checkQuota(workspaceId, "storage");
    const policy = UPLOAD_POLICIES[dto.context as UploadContext];

    // CHECK 07-E: size
    if (dto.fileSize > policy.maxSizeBytes) {
      throw new BadRequestException(
        `File too large. Maximum for ${dto.context} is ` +
          `${Math.round(policy.maxSizeBytes / 1024 / 1024)}MB, ` +
          `received ${Math.round(dto.fileSize / 1024 / 1024)}MB.`,
      );
    }

    // CHECK 07-D: MIME type
    if (!(policy.allowedMimeTypes as readonly string[]).includes(dto.mimeType)) {
      throw new BadRequestException(
        `MIME type '${dto.mimeType}' not allowed for ${dto.context}. ` +
          `Allowed: ${policy.allowedMimeTypes.join(", ")}`,
      );
    }

    // CHECK 07-C: extension from filename
    const ext = getFileExtension(dto.fileName);
    if (ext && !(policy.allowedExtensions as readonly string[]).includes(ext)) {
      throw new BadRequestException(
        `Extension '${ext}' not allowed for ${dto.context}.`,
      );
    }

    // CHECK 07-B: sanitize filename
    const safeName = sanitizeFilename(dto.fileName);

    // Key format: workspaceId/context/uuid/safeName
    const key = `${workspaceId}/${dto.context}/${randomUUID()}/${safeName}`;

    // Get URL from provider
    const url = await this.storage.getUploadUrl(key, dto.mimeType, 300);

    const fileRecord = await withTenantTx(
      workspaceId,
      (tx) =>
        this.fileRepo.create(
          {
            workspaceId,
            userId,
            name: safeName,
            size: dto.fileSize,
            mimeType: dto.mimeType,
            key,
            provider: this.providerType,
            status: "pending",
          },
          tx,
        ),
      this.db,
    );

    return {
      url,
      key,
      expiresAt: new Date(Date.now() + 300 * 1000),
      fileId: fileRecord.id,
    };
  }

  /**
   * Verifies the upload landed on the storage provider, then runs
   * defense-in-depth checks before flipping the row to `uploaded`:
   *
   *   1. headObject — confirms presence and reports actual size.
   *   2. Zero-byte rejection.
   *   3. Size check — rejects if the storage-reported byte count
   *      exceeds what the client declared at presign-time (the basis
   *      for quota + policy decisions).
   *   4. Magic-byte probe — range-fetches the first
   *      `MAGIC_BYTES_PROBE_SIZE` bytes and matches them against the
   *      declared MIME type.
   *
   * Any failure marks the row `failed`, attempts to delete the object,
   * and writes a `storage.upload_rejected` audit row before throwing.
   */
  async completeUpload(fileId: string, workspaceId: string): Promise<File> {
    return withTenantTx(
      workspaceId,
      async (tx) => {
        const file = await this.fileRepo.findById(fileId, tx);
        if (!file || file.workspaceId !== workspaceId) {
          throw new NotFoundException("File not found");
        }

        // Idempotent: a previously-confirmed row stays as it is.
        if (file.status !== "pending") {
          return file;
        }

        let head: FileMetadata;
        try {
          head = await this.storage.headObject(file.key);
        } catch {
          throw new BadRequestException(
            "File not found on storage provider. Please upload first.",
          );
        }

        const actualSize = head.contentLength ?? 0;

        if (actualSize === 0) {
          await this.rejectUpload(
            tx,
            file,
            "empty_file",
            "Upload is empty (zero bytes)",
            workspaceId,
          );
          throw new BadRequestException("Upload is empty (zero bytes)");
        }

        if (actualSize > file.size) {
          const reason =
            `Upload size mismatch: declared ${file.size} bytes, ` +
            `actual ${actualSize} bytes`;
          await this.rejectUpload(
            tx,
            file,
            "size_mismatch",
            reason,
            workspaceId,
          );
          throw new BadRequestException(reason);
        }

        const probe = await this.storage.getObjectBytes(
          file.key,
          MAGIC_BYTES_PROBE_SIZE,
        );
        const verdict = await verifyMagicBytes(probe, file.mimeType);
        if (!verdict.ok) {
          await this.rejectUpload(
            tx,
            file,
            "magic_byte_mismatch",
            verdict.reason,
            workspaceId,
          );
          throw new UnsupportedMediaTypeException(verdict.reason);
        }

        return await this.fileRepo.updateStatus(fileId, "uploaded", tx);
      },
      this.db,
    );
  }

  async getDownloadUrl(
    fileId: string,
    workspaceId: string,
    expiresIn = 3600,
  ): Promise<{ url: string }> {
    const file = await withTenantTx(
      workspaceId,
      (tx) => this.fileRepo.findById(fileId, tx),
      this.db,
    );
    if (
      !file ||
      file.workspaceId !== workspaceId ||
      file.status !== "uploaded"
    ) {
      throw new NotFoundException("File not found or not uploaded yet");
    }
    const url = await this.storage.getDownloadUrl(file.key, expiresIn);
    return { url };
  }

  async listFiles(workspaceId: string): Promise<FileInfo[]> {
    const records = await withTenantTx(
      workspaceId,
      (tx) => this.fileRepo.listByWorkspace(workspaceId, tx),
      this.db,
    );

    const uploaded = records.filter((f) => f.status === "uploaded");

    const results = await Promise.all(
      uploaded.map(async (file): Promise<FileInfo | null> => {
        try {
          const url = await this.storage.getDownloadUrl(file.key);
          return {
            id: file.id,
            name: file.name,
            url,
            size: file.size,
            type: file.mimeType,
            status: file.status,
            createdAt: file.createdAt.toISOString(),
          };
        } catch {
          return null;
        }
      }),
    );

    return results.filter((f): f is FileInfo => f !== null);
  }

  async deleteFile(fileId: string, workspaceId: string): Promise<void> {
    await withTenantTx(
      workspaceId,
      async (tx) => {
        const file = await this.fileRepo.findById(fileId, tx);
        if (!file || file.workspaceId !== workspaceId) {
          throw new NotFoundException("File not found");
        }

        await this.fileRepo.updateStatus(fileId, "deleted", tx);

        await this.auditLog.create(
          {
            workspaceId,
            userId: file.userId,
            action: "storage.file_deleted",
            entityType: "file",
            entityId: file.id,
            metadata: { name: file.name, mimeType: file.mimeType, size: file.size },
          },
          tx,
        );

        // Best-effort: may already be gone on the provider side
        try {
          await this.storage.delete(file.key);
        } catch (error) {
          this.logger.warn(
            `Failed to delete file from storage key=${file.key}: ${(error as Error).message}`,
          );
        }
      },
      this.db,
    );
  }

  private async rejectUpload(
    tx: Database,
    file: File,
    reasonCode: string,
    reasonMessage: string,
    workspaceId: string,
  ): Promise<void> {
    await this.fileRepo.updateStatus(file.id, "failed", tx);
    await this.auditLog.create(
      {
        workspaceId,
        userId: file.userId,
        action: "storage.upload_rejected",
        entityType: "file",
        entityId: file.id,
        metadata: {
          reasonCode,
          reason: reasonMessage,
          mimeType: file.mimeType,
          declaredSize: file.size,
        },
      },
      tx,
    );
    // Best-effort delete; the row is already marked failed regardless.
    try {
      await this.storage.delete(file.key);
    } catch (error) {
      this.logger.warn(
        `Failed to delete rejected upload key=${file.key}: ${
          (error as Error).message
        }`,
      );
    }
  }
}
