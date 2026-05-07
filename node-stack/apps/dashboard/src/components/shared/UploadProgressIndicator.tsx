import { UploadProgress } from "@/hooks/use-s3-upload";
import { Upload, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface UploadProgressIndicatorProps {
  progress: UploadProgress;
  onRetry?: () => void;
  onCancel?: () => void;
  filename?: string;
}

export const UploadProgressIndicator = ({
  progress,
  onRetry,
  onCancel,
  filename,
}: UploadProgressIndicatorProps) => {
  const getIcon = () => {
    switch (progress.stage) {
      case "uploading":
      case "confirming":
        return <Upload className="w-5 h-5 animate-pulse" />;
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Upload className="w-5 h-5" />;
    }
  };

  const getStageLabel = () => {
    switch (progress.stage) {
      case "uploading":
        return "Uploading...";
      case "confirming":
        return "Confirming...";
      case "complete":
        return "Upload complete";
      case "error":
        return progress.error || "Upload failed";
      default:
        return filename || "Ready";
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <p className="text-sm font-label text-gray-900 dark:text-gray-100">
              {getStageLabel()}
            </p>
            {filename && progress.stage === "idle" && (
              <p className="text-xs text-fg-secondary">{filename}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {progress.stage === "error" && onRetry && (
            <button
              onClick={onRetry}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {(progress.stage === "uploading" || progress.stage === "confirming") && onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Cancel"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {(progress.stage === "uploading" || progress.stage === "confirming") && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      )}

      {progress.stage === "error" && progress.retryCount > 0 && (
        <p className="text-xs text-fg-secondary">
          Retry {progress.retryCount}/3
        </p>
      )}
    </div>
  );
};