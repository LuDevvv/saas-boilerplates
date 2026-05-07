import { AxiosInstance } from "axios";
import { 
  GetPresignedUrlDto,
  PresignedUrlResponse,
  VerifyUploadResponse,
  FileInfo
} from "@node-stack/types";

export const storage = (client: AxiosInstance) => ({
  getUploadUrl: async (data: GetPresignedUrlDto) => {
    const { data: response } = await client.post<{ data: PresignedUrlResponse }>("/storage/upload-url", data);
    return response.data;
  },

  confirmUpload: async (fileId: string) => {
    const { data: response } = await client.post<{ data: VerifyUploadResponse }>("/storage/confirm-upload", { fileId });
    return response.data;
  },

  getDownloadUrl: async (fileId: string) => {
    const { data: response } = await client.get<{ data: { downloadUrl: string } }>(`/storage/${fileId}`);
    return response.data;
  },

  deleteFile: async (fileId: string) => {
    const { data } = await client.delete<{ success: boolean }>(`/storage/${fileId}`);
    return data.success;
  },

  listFiles: async (workspaceId: string) => {
    const { data } = await client.get<{ data: FileInfo[] }>(`/storage/workspaces/${workspaceId}`);
    return data.data;
  },
});
