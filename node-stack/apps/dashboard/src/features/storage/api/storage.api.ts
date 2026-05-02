import { apiClient } from "@/shared/lib/api";

export interface StorageFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  status: "Pending" | "Ready" | "Failed";
  createdAt: string;
}

export interface UploadUrlResponse {
  fileId: string;
  uploadUrl: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}

export interface StorageStats {
  usedBytes: number;
  totalBytes: number;
  fileCount: number;
}

export const storageApi = {
  getUploadUrl: (workspaceId: string, name: string, contentType: string, size: number): Promise<UploadUrlResponse> =>
    apiClient.post("/storage/upload-url", { workspaceId, name, contentType, size }),

  confirmUpload: (fileId: string): Promise<StorageFile> =>
    apiClient.post("/storage/confirm-upload", { fileId }),

  getDownloadUrl: (fileId: string): Promise<DownloadUrlResponse> =>
    apiClient.get(`/storage/${fileId}`),

  listFiles: (workspaceId: string): Promise<StorageFile[]> =>
    apiClient.get(`/storage/workspace/${workspaceId}`),

  deleteFile: (fileId: string): Promise<void> =>
    apiClient.delete(`/storage/${fileId}`),

  getStats: (workspaceId: string): Promise<StorageStats> =>
    apiClient.get(`/storage/workspace/${workspaceId}/stats`),
};