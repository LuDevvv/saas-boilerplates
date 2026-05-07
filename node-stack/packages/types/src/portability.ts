export type ExportStatus = "pending" | "processing" | "completed" | "failed" | "expired";

export interface ExportRequest {
  id: string;
  workspaceId: string;
  requestedBy: string;
  status: ExportStatus;
  fileUrl?: string;
  expiresAt?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ExportDownloadResponse {
  downloadUrl: string;
}
