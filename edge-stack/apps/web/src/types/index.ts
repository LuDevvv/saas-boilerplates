export interface IUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  twoFactorEnabled?: boolean;
  accounts?: string[];
}

export interface IWorkspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  role: string;
  memberCount?: number;
  plan?: "free" | "pro" | "trial" | "enterprise";
}

export type Theme = "light" | "dark" | "system";

export interface UIState {
  theme: Theme;
  isSidebarCollapsed: boolean;
  isLoading: boolean;
}
export interface IUsageMetric {
  metricName: string;
  currentUsage: number;
  quotaLimit: number;
}

export interface IDashboardMetrics {
  teamMembers: number;
  totalTasks: number;
  subscriptionStatus: string | null;
  usage: IUsageMetric[];
}

export interface ISubscription {
  id: string;
  planId: string;
  variantId: string;
  status: string;
  nextPaymentAt: string | null;
  endsAt: string | null;
}

export interface ISubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: ISubscription | null;
}
