import { randomUUID } from "crypto";

import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import type { StorageService } from "@node-stack/storage";
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
  MimeType,
} from "@node-stack/validators";

@Injectable()
export class AppStorageService {
  constructor(
    @Inject("STORAGE_SERVICE") private readonly storage: StorageService,
  ) {}

  async getPresignedUploadUrl(
    dto: GetPresignedUrlDto,
    workspaceId: string,
    userId: string,
  ): Promise<{ url: string; key: string; expiresAt: Date }> {
    const policy = UPLOAD_POLICIES[dto.context as UploadContext];

    // CHECK 07-E: size
    if (dto.fileSize > policy.maxSizeBytes) {
      throw new BadRequestException(
        `File too large. Maximum for ${dto.context} is ` +
          `${Math.round(policy.maxSizeBytes / 1024 / 1024)}MB, ` +
          `received ${Math.round(dto.fileSize / 1024 / 1024)}MB.`,
      );
    }

    // CHECK 07-D: MIME type (client-declared — first enforcement layer)
    if (
      !(policy.allowedMimeTypes as readonly string[]).includes(dto.mimeType)
    ) {
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

    // CHECK 07-C: sanitize filename (path traversal prevention)
    const safeName = sanitizeFilename(dto.fileName);

    // Key format prevents any traversal: workspaceId is trusted, rest is sanitized
    const key = `${workspaceId}/${dto.context}/${randomUUID()}/${safeName}`;

    // Second enforcement layer: S3 will reject upload if Content-Type/Length differs
    const result = await this.storage.getPresignedUploadUrl({
      key,
      contentType: dto.mimeType,
      contentLength: dto.fileSize,
      metadata: {
        "x-workspace-id": workspaceId,
        "x-upload-context": dto.context,
        "x-original-name": safeName,
        "x-uploaded-by": userId,
      },
      expires: 300,
    });

    return result;
  }
}
