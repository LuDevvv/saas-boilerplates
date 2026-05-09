import { apiClient } from "@/lib/api";

export interface DashboardStats {
  totalUsers?: number;
  activeWorkspaces?: number;
  revenue?: number;
  growth?: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId: string;
  workspaceId: string;
}

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> => 
    apiClient.get("/analytics/stats"),
    
  getRecentActivity: (): Promise<ActivityItem[]> => 
    apiClient.get("/analytics/activity"),
    
  getOnboardingStatus: (): Promise<Record<string, unknown>[]> =>
    apiClient.get("/workspaces/onboarding"),

  getReleaseNotes: (): Promise<Record<string, unknown>[]> =>
    apiClient.get("/system/release-notes"),
};
