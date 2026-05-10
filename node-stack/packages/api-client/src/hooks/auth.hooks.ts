import type { AuthResponse, AuthTokens, UserEntity } from "@node-stack/types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseQueryOptions,
} from "@tanstack/react-query";


import { auth } from "../auth.js";
import { apiClient } from "../client.js";
import type { components } from "../schema.js";

const authApi = auth(apiClient);

// ─── Me ─────────────────────────────────────────────────────────────────────

export function useMe(
  options?: Omit<UseQueryOptions<UserEntity>, "queryKey" | "queryFn">,
) {
  return useQuery<UserEntity>({
    queryKey: ["me"],
    queryFn: () => authApi.me(),
    ...options,
  });
}

// ─── Login ───────────────────────────────────────────────────────────────────

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<AuthResponse, Error, components["schemas"]["LoginDto"]>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (res) => {
      const r = res as AuthResponse & { token?: string };
      const access = r.accessToken ?? r.token ?? "";
      try {
        if (access) localStorage.setItem("auth_token", access);
        const tokens = res as AuthResponse & AuthTokens;
        if (tokens.refreshToken) localStorage.setItem("refresh_token", tokens.refreshToken);
      } catch { /* SSR */ }
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

// ─── Register ────────────────────────────────────────────────────────────────

export function useRegister() {
  return useMutation<AuthResponse, Error, components["schemas"]["RegisterDto"]>({
    mutationFn: (data) => authApi.register(data),
  });
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export function useLogout() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      } catch { /* SSR */ }
      qc.removeQueries({ queryKey: ["me"] });
      qc.removeQueries({ queryKey: ["sessions"] });
    },
  });
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export function useSessions() {
  return useQuery<unknown[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const result = await authApi.getSessions();
      return Array.isArray(result) ? result : [];
    },
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => authApi.revokeSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

// ─── Audit Logs (cursor-paginated) ───────────────────────────────────────────

export type AuditLogsParams = {
  cursor?: string;
  limit?: number;
  action?: string;
};

export function useAuditLogs(params?: AuditLogsParams) {
  return useInfiniteQuery<
    unknown[],
    Error,
    InfiniteData<unknown[]>,
    ["audit-logs", AuditLogsParams | undefined],
    string | null
  >({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      // TODO: forward cursor/limit/action when authApi.getAuditLogs supports params
      const result = await authApi.getAuditLogs();
      return Array.isArray(result) ? result : [];
    },
    initialPageParam: null,
    // TODO: derive nextCursor from response meta once API response is typed
    getNextPageParam: () => null,
  });
}
