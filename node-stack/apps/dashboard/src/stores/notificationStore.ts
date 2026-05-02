import { create } from "zustand";

interface NotificationState {
  // Client-only state can go here (e.g., toast visibility, etc.)
}

export const useNotificationStore = create<NotificationState>(() => ({
  // Empty for now as all logic moved to React Query
}));
