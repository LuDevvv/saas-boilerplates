import type { GetPresignedUrlDto } from "@node-stack/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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
 * Single-file upload entrypoint that ALSO mirrors progress into the global
 * upload tray store. Each call:
 *
 * 1. Creates a queue item via `useUploadStore.add`.
 * 2. Streams progress via XHR.
 * 3. Marks the item success/error.
 * 4. Returns `{ fileUrl }` on success or rejects (caller handles).
 *
 * `context` controls the backend upload policy:
 *   - "avatar"     → 5 MB limit, image types only (JPEG/PNG/WebP/GIF)
 *   - "attachment" → 50 MB limit, images + PDF + spreadsheets + text/CSV (default)
 *   - "export"     → 100 MB limit, JSON/CSV only
 *
 * Multiple concurrent uploads are supported — each call gets its own item.
 */
export const useUploadFile = (
  workspaceId: string | null,
  context: UploadContext = "attachment",
) => {
  const queryClient = useQueryClient();
  const addItem = useUploadStore((s) => s.add);
  const setProgress = useUploadStore((s) => s.setProgress);
  const setStatus = useUploadStore((s) => s.setStatus);
  const setAbort = useUploadStore((s) => s.setAbort);

  // Aggregate state for backward-compat callers (Profile/Company/Reports)
  const items = useUploadStore((s) => s.items);
  const inFlight = items.filter((it) => it.status === "uploading" || it.status === "queued");
  const isUploading = inFlight.length > 0;
  const progress = inFlight.length > 0 ? Math.round(inFlight.reduce((a, b) => a + b.progress, 0) / inFlight.length) : 0;

  const upload = useCallback(
    async (file: File): Promise<UploadResult | undefined> => {
      if (!workspaceId) {
        appToast.error({
          title: "Sin workspace",
          description: "Selecciona una compañía activa antes de subir archivos.",
        });
        return;
      }

      const itemId = addItem(file);

      try {
        setStatus(itemId, "uploading");
        setProgress(itemId, 5);

        const { uploadUrl, fileUrl } = await api.storage.getUploadUrl({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          context,
        } as GetPresignedUrlDto);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          // Allow cancellation via the store
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
        await api.storage.confirmUpload(fileId);

        setProgress(itemId, 100);
        setStatus(itemId, "success", { fileUrl });
        queryClient.invalidateQueries({ queryKey: ["storage", "files", workspaceId] });

        // Auto-remove successful items from the tray after a moment
        setTimeout(() => useUploadStore.getState().remove(itemId), 4000);

        return { fileUrl };
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
    [workspaceId, context, queryClient, addItem, setProgress, setStatus, setAbort]
  );

  /** Re-attempts an existing failed upload using its stored File reference. */
  const retry = useCallback(
    async (itemId: string): Promise<UploadResult | undefined> => {
      const item = useUploadStore.getState().items.find((it) => it.id === itemId);
      if (!item) return;
      // Remove the failed item so the retry produces a fresh queue entry
      useUploadStore.getState().remove(itemId);
      return upload(item.file);
    },
    [upload]
  );

  return { upload, retry, isUploading, progress };
};
