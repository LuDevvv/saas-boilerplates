import { AxiosInstance } from "axios";
import { createClient } from "./client";
import { GetPresignedUrlSchema, sanitizeFilename } from "@node-stack/validators";

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
}

export interface VerifyUploadResponse {
  success: boolean;
  fileUrl: string;
}

export interface FileInfo {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export const storage = (client: AxiosInstance) => ({
  getPresignedUrl: async (body: {
    filename: string;
    mimeType: string;
    folder?: string;
  }) => {
    const parsed = GetPresignedUrlSchema.parse({
      ...body,
      filename: sanitizeFilename(body.filename),
    });
    
    return await client.post<{ data: PresignedUrlResponse }>("/storage/presigned-url", parsed);
  },

  verifyUpload: async (body: { uploadId: string; fileKey: string }) => {
    return await client.post<{ data: VerifyUploadResponse }>("/storage/verify-upload", body);
  },

  deleteFile: async (fileKey: string) => {
    return await client.delete<{ success: boolean }>(`/storage/files/${encodeURIComponent(fileKey)}`);
  },

  listFiles: async (params?: { folder?: string; page?: number; limit?: number }) => {
    return await client.get<{ data: FileInfo[]; meta: { page: number; limit: number; total: number } }>("/storage/files", { params });
  },
});
