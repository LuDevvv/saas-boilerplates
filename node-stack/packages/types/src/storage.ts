export interface GetPresignedUrlDto {
  fileName: string;
  mimeType: string;
  fileSize: number;
  context?: string;
}

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
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  status: string;
  createdAt: string;
}
