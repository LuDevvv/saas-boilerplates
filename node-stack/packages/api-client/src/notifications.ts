import { AxiosInstance } from "axios";
import { PaginatedResponse, Notification } from "@node-stack/types";

export const notifications = (client: AxiosInstance) => ({
  list: async (params?: { workspaceId?: string; page?: number; limit?: number; unread?: boolean; read?: boolean }) => {
    const { data } = await client.get<PaginatedResponse<Notification>>("/notifications", { params });
    return data;
  },

  markAsRead: async (notificationId: string) => {
    const { data } = await client.patch<{ success: boolean }>(`/notifications/${notificationId}/read`);
    return data.success;
  },

  markAllAsRead: async () => {
    const { data } = await client.post<{ success: boolean }>("/notifications/mark-all-read");
    return data.success;
  },

  getUnreadCount: async () => {
    const { data } = await client.get<{ count: number }>("/notifications/unread-count");
    return data.count;
  },

  dismiss: async (notificationId: string) => {
    const { data } = await client.delete<{ success: boolean }>(`/notifications/${notificationId}`);
    return data.success;
  },

  testNotification: async (data: { userId: string; workspaceId?: string; templateName: 'WELCOME' | 'AI_COMPLETED'; data: any }) => {
    const { data: response } = await client.post<{ success: boolean; message: string }>("/notifications/test", data);
    return response;
  },
});
