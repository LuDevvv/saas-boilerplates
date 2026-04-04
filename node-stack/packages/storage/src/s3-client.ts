import { S3Client } from "@aws-sdk/client-s3";

export const createS3Client = (config: {
  endpoint?: string;
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
}): S3Client => {
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
