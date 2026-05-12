import type { GetPresignedUrlDto } from "@node-stack/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

/** Strip characters the backend filename validator rejects */
const sanitizeFileName = (name: string): string => {
  const ext = name.lastIndexOf(".") >= 0 ? name.substring(name.lastIndexOf(".")) : "";
  const base = name.substring(0, name.length - ext.length);
  const safe = base.replace(/[^a-zA-Z0-9._\- ]/g, "_").replace(/_{2,}/g, "_").trim().substring(0, 90);
  return (safe || "file") + ext;
};

import { useUploadStore } from "../stores/uploadStore";

import { appToast } from "@/components/alerts/Toasts";
import { api } from "@/lib/api";



// ─── Files list ──────────────────────────────────────────────────────────────

export const useStorageFiles = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? ["storage", "files", workspaceId] : [],
    queryFn: () => api.storage.listFiles(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useDeleteFile = (workspaceId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => api.storage.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage", "files", workspaceId] });
      appToast.success({ title: "Archivo eliminado", description: "El archivo ha sido borrado permanentemente." });
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo eliminar el archivo." });
    },
  });
};

// ─── Stats ───────────────────────────────────────────────────────────────────

export const useStorageStats = (workspaceId: string | null) => {
  return useQuery({
    queryKey: workspaceId ? ["storage", "stats", workspaceId] : [],
    queryFn: async () => {
      // TODO: implement backend endpoint for quota tracking
      return { usedBytes: 0, fileCount: 0, totalBytes: 5 * 1024 * 1024 * 1024 };
    },
    enabled: !!workspaceId,
  });
};

// ─── Upload ──────────────────────────────────────────────────────────────────

interface UploadResult {
  fileUrl: string;
}

type UploadContext = "attachment" | "avatar" | "export";

/**
 * Single-file upload entrypoint.
 *
 * `context` controls the backend upload policy:
 *   - "avatar"     → 5 MB limit, image types only (JPEG/PNG/WebP/GIF)
 *   - "attachment" → 50 MB limit, images + PDF + spreadsheets + text/CSV (default)
 *   - "export"     → 100 MB limit, JSON/CSV only
 *
 * `silent: true` skips the global UploadTray entirely — use for avatar/logo
 * uploads where the result should update an inline element, not the file tray.
 * Defaults to false so the tray shows for storage-page uploads.
 */
export const useUploadFile = (
  workspaceId: string | null,
  context: UploadContext = "attachment",
  { silent = false }: { silent?: boolean } = {},
) => {
  const queryClient = useQueryClient();
  const addItem = useUploadStore((s) => s.add);
  const setProgress = useUploadStore((s) => s.setProgress);
  const setStatus = useUploadStore((s) => s.setStatus);
  const setAbort = useUploadStore((s) => s.setAbort);

  const items = useUploadStore((s) => s.items);
  const inFlight = items.filter((it) => it.status === "uploading" || it.status === "queued");
  const storeIsUploading = inFlight.length > 0;
  const progress = inFlight.length > 0 ? Math.round(inFlight.reduce((a, b) => a + b.progress, 0) / inFlight.length) : 0;

  // Silent mode bypasses the store so we track uploading state locally
  const [silentCount, setSilentCount] = useState(0);
  const isUploading = silent ? silentCount > 0 : storeIsUploading;

  const upload = useCallback(
    async (file: File): Promise<UploadResult | undefined> => {
      if (!workspaceId) {
        appToast.error({
          title: "Sin workspace",
          description: "Selecciona una compañía activa antes de subir archivos.",
        });
        return;
      }

      // Silent mode: skip the global tray; use a plain XHR with no store interaction
      if (silent) {
        setSilentCount((n) => n + 1);
        try {
          const { uploadUrl, fileUrl } = await api.storage.getUploadUrl({
            fileName: sanitizeFileName(file.name),
            mimeType: file.type,
            fileSize: file.size,
            context,
          } as GetPresignedUrlDto);

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) resolve();
              else reject(new Error(`Subida falló (HTTP ${xhr.status})`));
            });
            xhr.addEventListener("error", () => reject(new Error("Error de red durante la subida")));
            xhr.open("PUT", uploadUrl, true);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
          });

          const fileId = fileUrl.split("/").pop() || "";
          const confirmed = await api.storage.confirmUpload(fileId);
          // Use the real R2 presigned URL from confirm, not the API endpoint URL
          return { fileUrl: confirmed.fileUrl || fileUrl };
        } catch (error: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const message = (error as any)?.message || "No se pudo subir el archivo";
          appToast.error({ title: "Error de carga", description: message });
          throw error;
        } finally {
          setSilentCount((n) => Math.max(0, n - 1));
        }
      }

      // Normal mode: mirror progress into the global upload tray store
      const itemId = addItem(file);

      try {
        setStatus(itemId, "uploading");
        setProgress(itemId, 5);

        const { uploadUrl, fileUrl } = await api.storage.getUploadUrl({
          fileName: sanitizeFileName(file.name),
          mimeType: file.type,
          fileSize: file.size,
          context,
        } as GetPresignedUrlDto);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          setAbort(itemId, () => xhr.abort());

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded * 85) / event.total);
              setProgress(itemId, 5 + pct);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Subida falló (HTTP ${xhr.status})`));
          });
          xhr.addEventListener("error", () => reject(new Error("Error de red durante la subida")));
          xhr.addEventListener("abort", () => reject(new Error("Subida cancelada")));

          xhr.open("PUT", uploadUrl, true);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setProgress(itemId, 95);
        const fileId = fileUrl.split("/").pop() || "";
        const confirmed = await api.storage.confirmUpload(fileId);
        // Use the real R2 presigned URL so callers can use it as <img src>
        const finalUrl = confirmed.fileUrl || fileUrl;

        setProgress(itemId, 100);
        setStatus(itemId, "success", { fileUrl: finalUrl });
        queryClient.invalidateQueries({ queryKey: ["storage", "files", workspaceId] });

        setTimeout(() => useUploadStore.getState().remove(itemId), 4000);

        return { fileUrl: finalUrl };
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = (error as any)?.message || "No se pudo subir el archivo";
        const isCancelled = message === "Subida cancelada";
        setStatus(itemId, isCancelled ? "cancelled" : "error", {
          error: isCancelled ? undefined : message,
        });
        if (!isCancelled) {
          appToast.error({ title: "Error de carga", description: message });
        }
        throw error;
      }
    },
    [workspaceId, context, silent, queryClient, addItem, setProgress, setStatus, setAbort]
  );

  const retry = useCallback(
    async (itemId: string): Promise<UploadResult | undefined> => {
      const item = useUploadStore.getState().items.find((it) => it.id === itemId);
      if (!item) return;
      useUploadStore.getState().remove(itemId);
      return upload(item.file);
    },
    [upload]
  );

  return { upload, retry, isUploading, progress };
};
