import {
  GetPresignedUrlDto,
  PresignedUrlResponse,
  VerifyUploadResponse,
  FileInfo
} from "@node-stack/types";
import { AxiosInstance } from "axios";

export const storage = (client: AxiosInstance) => ({
  getUploadUrl: async (data: GetPresignedUrlDto) => {
    return client.post<PresignedUrlResponse>("/storage/upload-url", data) as unknown as Promise<PresignedUrlResponse>;
  },

  confirmUpload: async (fileId: string) => {
    return client.post<VerifyUploadResponse>("/storage/confirm-upload", {
      fileId,
    }) as unknown as Promise<VerifyUploadResponse>;
  },

  getDownloadUrl: async (fileId: string) => {
    return client.get<{ url: string }>(`/storage/${fileId}`) as unknown as Promise<{ url: string }>;
  },

  deleteFile: async (fileId: string) => {
    return client.delete<{ ok: boolean }>(`/storage/${fileId}`) as unknown as Promise<{ ok: boolean }>;
  },

  listFiles: async (_workspaceId?: string) => {
    return client.get<FileInfo[]>("/storage") as unknown as Promise<FileInfo[]>;
  },
});
