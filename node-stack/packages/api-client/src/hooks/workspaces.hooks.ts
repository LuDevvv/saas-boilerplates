import type {
  CreateWorkspaceDto,
  PaginatedResponse,
  UpdateWorkspaceDto,
  Workspace,
} from "@node-stack/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";


import { apiClient } from "../client.js";
import { workspace } from "../workspace.js";

const workspaceApi = workspace(apiClient);

// ─── Workspaces ──────────────────────────────────────────────────────────────

export function useWorkspaces(
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<Workspace>>, "queryKey" | "queryFn">,
) {
  return useQuery<PaginatedResponse<Workspace>>({
    queryKey: ["workspaces", params],
    queryFn: () => workspaceApi.list(params) as unknown as Promise<PaginatedResponse<Workspace>>,
    ...options,
  });
}

export function useWorkspace(
  id: string,
  options?: Omit<UseQueryOptions<Workspace>, "queryKey" | "queryFn">,
) {
  return useQuery<Workspace>({
    queryKey: ["workspace", id],
    queryFn: () => workspaceApi.get(id) as unknown as Promise<Workspace>,
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation<Workspace, Error, CreateWorkspaceDto>({
    mutationFn: (data) => workspaceApi.create(data) as unknown as Promise<Workspace>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}

export function useUpdateWorkspace(id: string) {
  const qc = useQueryClient();
  return useMutation<Workspace, Error, UpdateWorkspaceDto>({
    mutationFn: (data) => workspaceApi.update(id, data) as unknown as Promise<Workspace>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["workspace", id] });
    },
  });
}

export function useDeleteWorkspace(id: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: () => workspaceApi.delete(id) as unknown as Promise<unknown>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.removeQueries({ queryKey: ["workspace", id] });
    },
  });
}
