import axios from "axios";
import { BaseService } from "./baseService";
import { 
  StorageContext, 
  PresignedUrlResponse, 
  VerifyUploadResponse 
} from "@/types/storage";

/**
 * Service for handling file storage using the Presigned URL pattern.
 * Flows:
 * 1. getPresignedUrl(fileName, fileType, context) -> { uploadUrl, fileKey }
 * 2. uploadFile(file, uploadUrl) -> Browser PUT directly to S3/R2
 * 3. verifyUpload(fileKey) -> Logic registration completion in Backend
 */
class StorageService extends BaseService {
  constructor() {
    super("/storage");
  }

  /**
   * Step 1: Request a presigned URL from the backend
   */
  async getPresignedUrl(
    fileName: string, 
    fileType: string, 
    context: StorageContext,
    contextId?: string
  ): Promise<PresignedUrlResponse> {
    if (this.useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        uploadUrl: "https://mock-s3-upload-url.com/put",
        fileKey: `mocks/${context}/${Date.now()}-${fileName}`,
        publicUrl: `https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&w=512&q=80`
      };
    }

    return this.post<PresignedUrlResponse>("/presigned", {
      fileName,
      fileType,
      context,
      contextId
    });
  }

  /**
   * Step 2: Upload file directly to the provided URL (S3/R2)
   */
  async uploadFile(
    file: File, 
    uploadUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (this.useMocks) {
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        onProgress?.(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      return;
    }

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(percentCompleted);
        }
      },
    });
  }

  /**
   * Step 3: Notify backend that upload is complete
   */
  async verifyUpload(fileKey: string): Promise<VerifyUploadResponse> {
    if (this.useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        message: "Mock upload verified",
        data: {} // In real life, this returns the updated User/Workspace
      };
    }

    return this.post<VerifyUploadResponse>("/verify", { fileKey });
  }
}

export const storageService = new StorageService();
