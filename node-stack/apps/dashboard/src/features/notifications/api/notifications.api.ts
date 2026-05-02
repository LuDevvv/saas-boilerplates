import { apiClient } from "@/lib/api";

export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

export const notificationsApi = {
  getNotifications: (params?: {
    page?: number;
    pageSize?: number;
    unread?: boolean;
    read?: boolean;
  }): Promise<NotificationListResponse> => {
    return apiClient.get("/notifications", { params });
  },

  getUnreadCount: (): Promise<{ count: number }> => 
    apiClient.get("/notifications/unread-count"),

  markAsRead: (id: string): Promise<void> => 
    apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: (): Promise<void> => 
    apiClient.post("/notifications/read-all"),

  dismiss: (id: string): Promise<void> => 
    apiClient.delete(`/notifications/${id}`),
};
