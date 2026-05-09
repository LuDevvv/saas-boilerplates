import { Notification } from "@node-stack/types";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";


export const useNotifications = (params?: { limit?: number; unread?: boolean; read?: boolean }) => {
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  
  return useQuery({
    queryKey: [...queryKeys.notifications.all, params?.limit, params?.unread, params?.read],
    queryFn: async () => {
      const response = await api.notifications.list(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((response as any)?.data ?? response ?? []) as Notification[];
    },
    enabled: isAuthenticated,
  });
};

export const useUnreadCount = () => {
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));

  return useQuery({
    queryKey: [...queryKeys.notifications.all, "unread-count"],
    queryFn: async () => {
      const response = await api.notifications.getUnreadCount();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response as any)?.count ?? response ?? 0;
    },
    enabled: isAuthenticated,
  });
};
