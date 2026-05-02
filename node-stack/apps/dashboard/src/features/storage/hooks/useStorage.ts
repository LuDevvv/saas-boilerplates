import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storageApi } from "../api/storage.api";
import { appToast } from "@/components/alerts/Toasts";

export const useStorageFiles = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? ["storage", "files", workspaceId] : [],
    queryFn: () => storageApi.listFiles(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useStorageStats = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? ["storage", "stats", workspaceId] : [],
    queryFn: () => storageApi.getStats(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useDeleteFile = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => storageApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage", "files", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["storage", "stats", workspaceId] });
      appToast.success({ title: "Archivo eliminado", description: "El archivo ha sido borrado permanentemente." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo eliminar el archivo." });
    },
  });
};

export const useUploadFile = (workspaceId: string | null) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const upload = useCallback(async (file: File) => {
    if (!workspaceId) return;
    
    setIsUploading(true);
    setProgress(0);

    try {
      setProgress(10);
      const { fileId, uploadUrl } = await storageApi.getUploadUrl(
        workspaceId,
        file.name,
        file.type,
        file.size
      );

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentCompleted = Math.round((event.loaded * 80) / event.total);
            setProgress(10 + percentCompleted);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setProgress(95);
      await storageApi.confirmUpload(fileId);

      setProgress(100);
      queryClient.invalidateQueries({ queryKey: ["storage", "files", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["storage", "stats", workspaceId] });
      appToast.success({ title: "Carga completada", description: `El archivo ${file.name} se subió correctamente.` });
    } catch (error) {
      console.error("Upload failed:", error);
      appToast.error({ title: "Error de carga", description: "No se pudo subir el archivo." });
      throw error;
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
    }
  }, [workspaceId, queryClient]);

  return { upload, isUploading, progress };
};
