export type StorageContext = 'avatar' | 'workspace_logo' | 'asset';

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

export interface VerifyUploadResponse {
  success: boolean;
  message?: string;
  data: any; // The updated entity (User or Workspace)
}
