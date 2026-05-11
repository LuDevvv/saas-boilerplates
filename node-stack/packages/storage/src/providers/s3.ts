import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { IStorageProvider, FileMetadata } from "../interface.js";
import { StorageConfig } from "../storage.service.js";

export class S3StorageProvider implements IStorageProvider {
  /** Internal client — used for headObject, delete, upload, ping.
   *  Uses the endpoint the API container can reach (e.g. http://minio:9000). */
  private client: S3Client;

  /** Presign client — used only for getUploadUrl / getDownloadUrl.
   *  Uses a publicly accessible endpoint (e.g. http://localhost:9000) so the
   *  presigned URLs the browser receives are actually reachable. Falls back to
   *  `client` when no publicEndpoint is configured. */
  private presignClient: S3Client;

  constructor(private config: StorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region ?? "auto",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: !!config.endpoint,
    });

    this.presignClient = config.publicEndpoint
      ? new S3Client({
          endpoint: config.publicEndpoint,
          region: config.region ?? "auto",
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
          forcePathStyle: true,
        })
      : this.client;
  }

  async getUploadUrl(key: string, contentType: string, expires: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.presignClient, command, { expiresIn: expires });
  }

  async getDownloadUrl(key: string, expires: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });
    return getSignedUrl(this.presignClient, command, { expiresIn: expires });
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });
    await this.client.send(command);
  }

  async headObject(key: string): Promise<FileMetadata> {
    const command = new HeadObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });
    const head = await this.client.send(command);
    return {
      contentLength: head.ContentLength,
      contentType: head.ContentType,
      lastModified: head.LastModified,
    };
  }

  async getObjectBytes(key: string, length: number): Promise<Uint8Array> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Range: `bytes=0-${Math.max(0, length - 1)}`,
    });
    const response = await this.client.send(command);
    const body = response.Body;
    if (!body) {
      return new Uint8Array(0);
    }
    const bytes = await body.transformToByteArray();
    return bytes;
  }

  async upload(options: {
    key: string;
    body: Buffer | string;
    contentType?: string;
    public?: boolean;
  }): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType,
      ACL: options.public ? "public-read" : "private",
    });
    await this.client.send(command);
  }

  async ping(): Promise<boolean> {
    try {
      const command = new HeadBucketCommand({
        Bucket: this.config.bucket,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
