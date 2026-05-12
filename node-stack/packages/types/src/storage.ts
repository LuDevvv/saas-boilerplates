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
  /** WebP thumbnail URL (≤400 px wide). Present for image files only. */
  thumbnailUrl?: string | null;
  size: number;
  type: string;
  status: string;
  createdAt: string;
}
