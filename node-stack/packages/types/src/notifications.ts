export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
