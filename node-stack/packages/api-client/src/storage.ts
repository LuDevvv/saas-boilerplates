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
    return client.get<{ downloadUrl: string }>(`/storage/${fileId}`) as unknown as Promise<{ downloadUrl: string }>;
  },

  deleteFile: async (fileId: string) => {
    return client.delete<{ success: boolean }>(`/storage/${fileId}`) as unknown as Promise<{ success: boolean }>;
  },

  listFiles: async (workspaceId: string) => {
    return client.get<FileInfo[]>(`/storage/workspaces/${workspaceId}`) as unknown as Promise<FileInfo[]>;
  },
});
