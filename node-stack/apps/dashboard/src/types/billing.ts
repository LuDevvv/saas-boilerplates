export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  buttonText: string;
  isCurrent: boolean;
  badge?: string;
}

export interface SubscriptionInfo {
  planId: string;
  name: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  price: number;
  currency: string;
  interval: "month" | "year";
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageMetric {
  used: number;
  limit: number | null; // null for unlimited
  unit: string;
}

export interface UsageStats {
  aiJobs: UsageMetric;
  storage: UsageMetric;
}

export interface BillingDetailsResponse {
  currentSubscription: SubscriptionInfo;
  availablePlans: BillingPlan[];
  usageStats: UsageStats;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface PortalLinkResponse {
  portalUrl: string;
}

export interface CreateCheckoutParams {
  planId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}
