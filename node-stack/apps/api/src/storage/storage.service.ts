import { randomUUID } from "crypto";
import { Injectable, Inject, BadRequestException, NotFoundException } from "@nestjs/common";
import type { IStorageProvider } from "@node-stack/storage";
import {
  UPLOAD_POLICIES,
  sanitizeFilename,
  getFileExtension,
} from "@node-stack/validators";
import {
  GetPresignedUrlDto,
} from "@node-stack/validators";
import type {
  UploadContext,
} from "@node-stack/validators";
import { FileRepository } from "@node-stack/db";
import { UsageQuotaService } from "../analytics/usage-quota.service";


@Injectable()
export class AppStorageService {
  constructor(
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
    private readonly fileRepo: FileRepository,
    private readonly usageQuotaService: UsageQuotaService,
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

    // Create record in DB
    const fileRecord = await this.fileRepo.create({
      workspaceId,
      userId: userId,
      name: safeName,
      size: dto.fileSize,
      mimeType: dto.mimeType,
      key,
      provider: "s3", // Or config based
      status: "pending",
    });

    return {
      url,
      key,
      expiresAt: new Date(Date.now() + 300 * 1000),
      fileId: fileRecord.id,
    };
  }

  async completeUpload(fileId: string, workspaceId: string): Promise<any> {
    const file = await this.fileRepo.findById(fileId);

    if (!file || file.workspaceId !== workspaceId) {
      throw new NotFoundException("File not found");
    }

    // Verify file exists on storage
    try {
      const metadata = await this.storage.headObject(file.key);
      // Update status to uploaded
      return await this.fileRepo.updateStatus(fileId, "uploaded");
    } catch (error) {
      throw new BadRequestException("File not found on storage provider. Please upload first.");
    }
  }

  async getDownloadUrl(fileId: string, workspaceId: string): Promise<{ url: string }> {
    const file = await this.fileRepo.findById(fileId);

    if (!file || file.workspaceId !== workspaceId || file.status !== "uploaded") {
      throw new NotFoundException("File not found or not uploaded yet");
    }

    const url = await this.storage.getDownloadUrl(file.key);
    return { url };
  }
}
