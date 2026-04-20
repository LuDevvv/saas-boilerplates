import { BaseService } from "../BaseService";

export interface DashboardMetric {
  title: string;
  value: string;
  change: string | number;
  trend: "up" | "down" | "neutral";
}

export interface ActivityItem {
  icon: string;
  title: string;
  time: string;
  status: "success" | "info" | "warning" | "error";
}

export interface QuickAction {
  label: string;
  icon: string;
  description: string;
}

export interface AnalyticsData {
  metrics: DashboardMetric[];
  recentActivity: ActivityItem[];
  quickActions: QuickAction;
}

class AnalyticsService extends BaseService {
  constructor() {
    super("analytics");
  }

  async getDashboardData(): Promise<any> {
    return this.handleRequest<any>(async () => {
      // In a real app, this would be an API call
      // return apiClient.get('/analytics/dashboard');
      throw new Error("Real API not implemented yet");
    });
  }

  async getWorkspaceUsage(workspaceId: string): Promise<any> {
    return this.get(`/workspaces/${workspaceId}/usage`);
  }
}

export const analyticsService = new AnalyticsService();
