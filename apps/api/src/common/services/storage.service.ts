import { AppError } from "@workspace/types";
import { AwsClient } from "aws4fetch";

/**
 * Storage service implementation for interacting with R2 directly.
 */
export interface StorageService {
  getUploadUrl(
    key: string,
    contentType: string,
    expires?: number,
  ): Promise<string>;
  getDownloadUrl(key: string, expires?: number): Promise<string>;
  put(
    key: string,
    body: ReadableStream | ArrayBuffer | string,
    contentType?: string,
  ): Promise<void>;
}

export interface StorageEnv {
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_ENDPOINT: string;
  R2_BUCKET_NAME: string;
  R2_BUCKET?: any; // Cloudflare R2 Bucket binding
}

/**
 * Factory to create a storage service instance communicating via AwsClient.
 * @param env - storage environment variables
 */
export const createStorageService = (env: StorageEnv): StorageService => {
  const aws = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });

  const urlEndpoint = new URL(env.R2_ENDPOINT);
  const baseUrl = `${urlEndpoint.protocol}//${urlEndpoint.host}/${env.R2_BUCKET_NAME}`;

  return {
    getUploadUrl: async (
      key: string,
      contentType: string,
      expires: number = 3600,
    ): Promise<string> => {
      const url = new URL(`${baseUrl}/${key}`);
      const signed = await aws.sign(url.toString(), {
        method: "PUT",
        headers: { "Content-Type": contentType },
        aws: { signQuery: true },
      });
      return signed.url;
    },

    getDownloadUrl: async (
      key: string,
      expires: number = 3600,
    ): Promise<string> => {
      const url = new URL(`${baseUrl}/${key}`);
      const signed = await aws.sign(url.toString(), {
        method: "GET",
        aws: { signQuery: true },
      });
      return signed.url;
    },

    put: async (
      key: string,
      body: ReadableStream | ArrayBuffer | string,
      contentType?: string,
    ): Promise<void> => {
      if (env.R2_BUCKET) {
        // Use native R2 binding if available
        await env.R2_BUCKET.put(key, body, {
          httpMetadata: { contentType },
        });
        return;
      }

      // Fallback to S3 API via aws4fetch
      const url = `${baseUrl}/${key}`;
      const signed = await aws.sign(url, {
        method: "PUT",
        body,
        headers: contentType ? { "Content-Type": contentType } : {},
      });

      const response = await fetch(signed.url, signed);
      if (!response.ok) {
        throw new AppError(
          `Failed to upload to storage: ${response.statusText}`,
          500,
          "STORAGE_ERROR",
        );
      }
    },
  };
};
