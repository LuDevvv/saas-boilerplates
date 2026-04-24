import { useState, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

export interface UploadProgress {
  stage: "idle" | "uploading" | "confirming" | "complete" | "error";
  progress: number;
  retryCount: number;
  error?: string;
}

interface UseS3UploadOptions {
  maxRetries?: number;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

export const useS3Upload = (options: UseS3UploadOptions = {}) => {
  const { maxRetries = 3, onSuccess, onError } = options;
  const [progress, setProgress] = useState<UploadProgress>({
    stage: "idle",
    progress: 0,
    retryCount: 0,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      presignedUrl,
      confirmUrl,
    }: {
      file: File;
      presignedUrl: string;
      confirmUrl: string;
    }) => {
      abortControllerRef.current = new AbortController();
      setProgress({ stage: "uploading", progress: 0, retryCount: 0 });

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        signal: abortControllerRef.current.signal,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      setProgress((p) => ({ ...p, stage: "confirming", progress: 90 }));

      const confirmResponse = await fetch(confirmUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!confirmResponse.ok) {
        throw new Error("Failed to confirm upload");
      }

      return confirmResponse.json();
    },
    onSuccess: (result) => {
      setProgress((p) => ({ ...p, stage: "complete", progress: 100 }));
      onSuccess?.(result);
    },
    onError: (error) => {
      const shouldRetry = progress.retryCount < maxRetries;

      if (shouldRetry) {
        setProgress((p) => ({
          ...p,
          stage: "error",
          retryCount: p.retryCount + 1,
          error: error.message,
        }));
      } else {
        setProgress((p) => ({
          ...p,
          stage: "error",
          error: "Upload failed after multiple retries",
        }));
        onError?.(error as Error);
      }
    },
  });

  const upload = useCallback(
    async (file: File, presignedUrl: string, confirmUrl: string) => {
      try {
        const result = await uploadMutation.mutateAsync({ file, presignedUrl, confirmUrl });
        return result;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          setProgress({ stage: "idle", progress: 0, retryCount: 0 });
        }
        throw error;
      }
    },
    [uploadMutation]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setProgress({ stage: "idle", progress: 0, retryCount: 0 });
  }, []);

  const reset = useCallback(() => {
    setProgress({ stage: "idle", progress: 0, retryCount: 0 });
  }, []);

  return {
    upload,
    cancel,
    reset,
    progress,
    isUploading: uploadMutation.isPending,
  };
};