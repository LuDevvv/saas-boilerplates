import type { FileInfo, GetPresignedUrlDto } from "@node-stack/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";


import { apiClient } from "../client.js";
import { storage } from "../storage.js";

const storageApi = storage(apiClient);

// ─── Files ───────────────────────────────────────────────────────────────────

export type FilesParams = {
  page?: number;
  limit?: number;
};

export function useFiles(
  workspaceId: string,
  _params?: FilesParams,
  options?: Omit<UseQueryOptions<FileInfo[]>, "queryKey" | "queryFn">,
) {
  return useQuery<FileInfo[]>({
    queryKey: ["files", workspaceId, _params],
    queryFn: () => storageApi.listFiles(workspaceId),
    enabled: Boolean(workspaceId),
    ...options,
  });
}

// ─── Upload (multipart) ──────────────────────────────────────────────────────

export function useUploadFile(workspaceId?: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, File>({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return apiClient.put<unknown>("/api/v1/storage/local", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }) as Promise<unknown>;
    },
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: ["files", workspaceId] });
      }
    },
  });
}

// ─── Get upload URL (presigned) ───────────────────────────────────────────────

export function useGetUploadUrl() {
  return useMutation<unknown, Error, GetPresignedUrlDto>({
    mutationFn: (data) => storageApi.getUploadUrl(data) as Promise<unknown>,
  });
}

// ─── Delete file ─────────────────────────────────────────────────────────────

export function useDeleteFile(workspaceId?: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => storageApi.deleteFile(id) as Promise<unknown>,
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: ["files", workspaceId] });
      }
    },
  });
}
