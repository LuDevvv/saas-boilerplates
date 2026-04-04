import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui";
import { client } from "../../lib/api";
import { Upload, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  currentValue?: string | null;
  accept?: string;
}

/**
 * A reusable file upload component optimized for direct-to-R2 uploads via presigned URLs.
 * Tracks upload progress and provides a preview for images.
 */
export function FileUpload({
  onUploadComplete,
  currentValue,
  accept = "image/*",
}: FileUploadProps) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentValue || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Basic validation
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }

      setPreviewUrl(URL.createObjectURL(selectedFile));
      startUpload(selectedFile);
    }
  };

  const startUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Request a presigned URL from the API
      const storageApi = client.api.storage["upload-url"] as any;
      const res = await storageApi.$post({
        json: {
          fileName: fileToUpload.name,
          contentType: fileToUpload.type,
          fileSize: fileToUpload.size,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to get upload URL");
      }

      const response = await res.json();
      const { uploadUrl, publicUrl } = response.data;

      // 2. Execute direct upload to R2 using XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) {
          onUploadComplete(publicUrl);
          setPreviewUrl(publicUrl);
          toast.success("File uploaded successfully");
          setIsUploading(false);
        } else {
          toast.error(`Upload failed with status ${xhr.status}`);
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        toast.error("Network error during upload");
        setIsUploading(false);
      };

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", fileToUpload.type);
      xhr.send(fileToUpload);
    } catch (error: any) {
      console.error("[FileUpload] Error:", error);
      toast.error(
        error.message || "An unexpected error occurred during upload",
      );
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted shadow-inner">
            <img
              src={previewUrl}
              alt="Avatar Preview"
              className="h-full w-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed bg-muted/50">
            <Upload className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="relative"
            >
              {isUploading
                ? "Uploading..."
                : previewUrl
                  ? "Change Image"
                  : "Select Image"}
            </Button>

            {previewUrl && !isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, max 10MB.
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Uploading to Edge Storage</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
    </div>
  );
}
