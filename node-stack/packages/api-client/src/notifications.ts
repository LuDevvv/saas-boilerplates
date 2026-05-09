import { AxiosInstance } from "axios";
import { PaginatedResponse, Notification } from "@node-stack/types";

export const notifications = (client: AxiosInstance) => ({
  list: async (params?: {
    workspaceId?: string;
    page?: number;
    limit?: number;
    unread?: boolean;
    read?: boolean;
  }) => {
    return client.get<PaginatedResponse<Notification>>("/notifications", {
      params,
    }) as unknown as Promise<PaginatedResponse<Notification>>;
  },

  markAsRead: async (notificationId: string) => {
    return client.patch<{ success: boolean }>(
      `/notifications/${notificationId}/read`,
    ) as unknown as Promise<{ success: boolean }>;
  },

  markAllAsRead: async () => {
    return client.post<{ success: boolean }>("/notifications/mark-all-read") as unknown as Promise<{ success: boolean }>;
  },

  getUnreadCount: async () => {
    return client.get<{ count: number }>("/notifications/unread-count") as unknown as Promise<{ count: number }>;
  },

  dismiss: async (notificationId: string) => {
    return client.delete<{ success: boolean }>(`/notifications/${notificationId}`) as unknown as Promise<{ success: boolean }>;
  },

  testNotification: async (data: {
    userId: string;
    workspaceId?: string;
    templateName: "WELCOME" | "AI_COMPLETED";
    data: any;
  }) => {
    return client.post<{ success: boolean; message: string }>(
      "/notifications/test",
      data,
    );
  },
});
