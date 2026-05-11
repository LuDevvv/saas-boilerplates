import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface StorageConfig {
  endpoint?: string;
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string;
}

export interface PresignedUploadOptions {
  key: string;
  contentType: string;
  contentLength?: number;
  metadata?: Record<string, string>;
  expires?: number;
}

export interface StorageService {
  getUploadUrl(
    key: string,
    contentType: string,
    expires?: number,
  ): Promise<string>;
  getPresignedUploadUrl(options: PresignedUploadOptions): Promise<{
    url: string;
    key: string;
    expiresAt: Date;
  }>;
  getDownloadUrl(key: string, expires?: number): Promise<string>;
  getPublicUrl(key: string): string;
  headObject(
    key: string,
  ): Promise<{ contentLength?: number; contentType?: string }>;
  delete(key: string): Promise<void>;
}

const getClient = (config: StorageConfig): S3Client => {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region ?? "auto",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: !!config.endpoint,
  });
};

export const createStorageService = (config: StorageConfig): StorageService => {
  const client = getClient(config);

  return {
    getUploadUrl: async (key, contentType, expires = 3600) => {
      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ContentType: contentType,
      });
      return getSignedUrl(client, command, { expiresIn: expires });
    },
    getPresignedUploadUrl: async (options) => {
      const expires = options.expires ?? 300;
      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: options.key,
        ContentType: options.contentType,
        ContentLength: options.contentLength,
        Metadata: options.metadata,
      });
      const url = await getSignedUrl(client, command, { expiresIn: expires });
      return {
        url,
        key: options.key,
        expiresAt: new Date(Date.now() + expires * 1000),
      };
    },
    getDownloadUrl: async (key, expires = 3600) => {
      const command = new GetObjectCommand({ Bucket: config.bucket, Key: key });
      return getSignedUrl(client, command, { expiresIn: expires });
    },
    getPublicUrl: (key) => `${config.publicUrl ?? ""}/${key}`,
    headObject: async (key) => {
      const command = new HeadObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });
      const head = await client.send(command);
      return {
        contentLength: head.ContentLength,
        contentType: head.ContentType,
      };
    },
    delete: async (key) => {
      const command = new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });
      await client.send(command);
    },
  };
};
