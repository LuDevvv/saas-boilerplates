import type { Context } from "hono";
import type { AppContext } from "../../common/types/env";
import { createStorageService } from "../../common/services/storage.service";
import { successResponse } from "../../common/responses";
import type { UploadRequestDTO } from "@workspace/validators";

/**
 * Controller for handling storage-related operations.
 */
export const StorageController = {
  /**
   * Generates a presigned URL for file uploads to R2.
   * @param c - Hono context
   */
  async getUploadUrl(c: Context<AppContext>) {
    const body = (await c.req.json()) as UploadRequestDTO;
    const env = c.env;
    const userId = c.get("userId");
    const storageService = createStorageService({
      R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
      R2_ENDPOINT: env.R2_ENDPOINT,
      R2_BUCKET_NAME: env.R2_BUCKET_NAME,
    });

    const fileKey = `avatars/${userId}/${crypto.randomUUID()}-${body.fileName}`;
    const uploadUrl = await storageService.getUploadUrl(
      fileKey,
      body.contentType,
    );

    // Public/view URL construction using edge-optimized URL joining
    const publicUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${fileKey}`;

    return c.json(
      successResponse({
        uploadUrl,
        publicUrl,
        key: fileKey,
      }),
      200,
    );
  },

  /**
   * Proxies an image directly from R2.
   * @param c - Hono context
   */
  async getImage(c: Context<AppContext>) {
    const key = c.req.param("key");
    const object = await c.env.R2_BUCKET.get(key);

    if (!object) {
      return c.json({ error: "Object not found" }, 404);
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "application/octet-stream",
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("ETag", object.httpEtag);

    return new Response(object.body as ReadableStream, { headers });
  },
};
