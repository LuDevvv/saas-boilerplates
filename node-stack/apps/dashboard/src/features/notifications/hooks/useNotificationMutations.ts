import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { appToast } from "@/components/alerts/Toasts";
import { useUser } from "@/features/auth/hooks/useUser";

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      appToast.success("Todas las notificaciones han sido marcadas como leídas");
    },
    onError: () => {
      appToast.error("Error al marcar todas como leídas");
    }
  });
};

export const useDismissNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.notifications.dismiss(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      appToast.success("Notificación descartada");
    },
    onError: () => {
      appToast.error("Error al descartar la notificación");
    }
  });
};

/**
 * Hook to seed mock notifications for development/testing
 */
export const useSeedNotifications = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No authenticated user");
      
      const mocks = [
        { templateName: 'WELCOME' as const, data: { name: user.firstName || 'Usuario' } },
        { templateName: 'AI_COMPLETED' as const, data: { task: 'Análisis de mercado' } }
      ];

      for (const mock of mocks) {
        await api.notifications.testNotification({
          userId: user.id,
          templateName: mock.templateName,
          data: mock.data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      appToast.success("Notificaciones de prueba generadas");
    }
  });
};
