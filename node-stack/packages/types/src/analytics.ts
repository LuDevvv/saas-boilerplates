export interface AnalyticsOverview {
  totalVisits: { value: number; change: number; trend: "up" | "down" };
  activeSessions: { value: number; change: number; trend: "up" | "down" };
  bounceRate: { value: number; change: number; trend: "up" | "down" };
}

export interface TrafficData {
  date: string;
  count: number;
}

export interface PageStat {
  path: string;
  views: string;
  growth: string;
}

export interface UsageData {
  ai: {
    tokens: { input: number; output: number };
    history: Array<{ date: string; input: number; output: number }>;
  };
  storage: {
    used: number;
    total: number;
  };
  activity: {
    trend: Array<{ date: string; count: number }>;
  };
}
