/**
 * ThumbnailService
 *
 * Generates compact WebP thumbnails from uploaded images and stores them
 * back to the same storage provider (R2/S3/local).
 *
 * Usage (inject wherever needed):
 *   constructor(private readonly thumbnails: ThumbnailService) {}
 *   const { thumbnailUrl } = await this.thumbnails.generate(file, imageBytes);
 *
 * Design decisions:
 *  - WebP is chosen for its superior compression at equivalent quality.
 *  - `fit: "inside"` keeps the original aspect ratio without cropping.
 *  - `withoutEnlargement: true` prevents upscaling small images.
 *  - All operations are best-effort: a thumbnail failure NEVER fails the upload.
 *  - The thumbnail key mirrors the original key under a `thumbs/` prefix so it
 *    lives in the same bucket partition and can be purged together with its parent.
 */


import { Injectable, Inject, Logger } from "@nestjs/common";
import type { IStorageProvider } from "@node-stack/storage";
import sharp from "sharp";

// MIME types we can safely thumbnail
const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/bmp",
]);

export interface ThumbnailOptions {
  /** Max dimension in pixels (applied to both width and height, aspect-ratio preserved). Default: 400 */
  maxPx?: number;
  /** WebP quality 1–100. Default: 80 */
  quality?: number;
}

export interface ThumbnailResult {
  /** Storage key of the generated thumbnail */
  thumbnailKey: string;
  /** Public or presigned URL of the thumbnail */
  thumbnailUrl: string;
}

@Injectable()
export class ThumbnailService {
  private readonly logger = new Logger(ThumbnailService.name);

  constructor(
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
  ) {}

  /**
   * Returns true if this MIME type can produce a thumbnail.
   * Useful for callers that want to skip the download step for non-image files.
   */
  canThumbnail(mimeType: string): boolean {
    return SUPPORTED_MIME_TYPES.has(mimeType.toLowerCase());
  }

  /**
   * Derives the thumbnail storage key from the original file key.
   *
   * Original key:  `{workspaceId}/{context}/{uuid}/{filename}.ext`
   * Thumbnail key: `{workspaceId}/thumbs/{uuid}.webp`
   *
   * The UUID segment is preserved so keys can be correlated without a DB lookup.
   */
  thumbnailKey(originalKey: string): string {
    const parts = originalKey.split("/");
    // parts[0] = workspaceId, parts[2] = uuid (per key convention in storage.service.ts)
    const workspaceId = parts[0] ?? "unknown";
    const uuid = parts[2] ?? parts[parts.length - 1];
    return `${workspaceId}/thumbs/${uuid}.webp`;
  }

  /**
   * Generates a WebP thumbnail from raw image bytes, uploads it to storage,
   * and returns the key + URL.
   *
   * @param originalKey   The storage key of the original file
   * @param imageBytes    Raw bytes of the image (e.g. from `getObjectBytes`)
   * @param mimeType      MIME type of the original file
   * @param options       Optional size / quality overrides
   * @returns             ThumbnailResult, or null if thumbnailing is not possible
   */
  async generate(
    originalKey: string,
    imageBytes: Uint8Array | Buffer,
    mimeType: string,
    options: ThumbnailOptions = {},
  ): Promise<ThumbnailResult | null> {
    if (!this.canThumbnail(mimeType)) return null;

    const { maxPx = 400, quality = 80 } = options;
    const tKey = this.thumbnailKey(originalKey);

    try {
      const thumbBuffer = await sharp(Buffer.from(imageBytes))
        .resize(maxPx, maxPx, { fit: "inside", withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();

      await this.storage.upload({
        key: tKey,
        body: thumbBuffer,
        contentType: "image/webp",
        public: true,
      });

      const thumbnailUrl = await this.resolveUrl(tKey);
      this.logger.debug(`Thumbnail generated: ${tKey} (${thumbBuffer.byteLength} bytes)`);
      return { thumbnailKey: tKey, thumbnailUrl };
    } catch (err: unknown) {
      // Non-fatal — original upload already succeeded
      this.logger.warn(`Thumbnail generation failed for key=${originalKey}: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Deletes a thumbnail from storage.
   * Best-effort — a delete failure is logged but not re-thrown.
   */
  async delete(thumbnailKey: string): Promise<void> {
    try {
      await this.storage.delete(thumbnailKey);
    } catch (err: unknown) {
      this.logger.warn(`Thumbnail delete failed for key=${thumbnailKey}: ${(err as Error).message}`);
    }
  }

  /**
   * Returns the public CDN URL if STORAGE_S3_PUBLIC_URL is configured,
   * or falls back to a 1-year presigned URL (effectively permanent for static assets).
   */
  private async resolveUrl(key: string): Promise<string> {
    const publicBase = process.env.STORAGE_S3_PUBLIC_URL;
    if (publicBase) {
      return `${publicBase.replace(/\/$/, "")}/${key}`;
    }
    return this.storage.getDownloadUrl(key, 365 * 24 * 60 * 60);
  }
}
