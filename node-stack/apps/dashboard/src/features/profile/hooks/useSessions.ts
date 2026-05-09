import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { appToast } from "@/components/alerts/Toasts";
import { api } from "@/lib/api";

export const useSessions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: () => api.auth.getSessions(),
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => api.auth.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
      appToast.success("Sesión cerrada correctamente");
    },
    onError: () => {
      appToast.error("Error al cerrar la sesión");
    }
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => api.auth.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
      appToast.success("Todas las sesiones han sido cerradas");
    },
    onError: () => {
      appToast.error("Error al cerrar las sesiones");
    }
  });

  return {
    sessions: query.data || [],
    isLoading: query.isLoading,
    revokeSession: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
    revokeAllSessions: revokeAllMutation.mutateAsync,
    isRevokingAll: revokeAllMutation.isPending,
  };
};
