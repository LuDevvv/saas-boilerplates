import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useNotifications = (params?: { pageSize?: number; unread?: boolean; read?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, params],
    queryFn: () => notificationsApi.getNotifications(params).then(res => res.data || []),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount().then(res => res.count),
  });
};
