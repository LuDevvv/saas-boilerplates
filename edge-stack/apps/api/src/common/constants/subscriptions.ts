/**
 * Subscription Tier identifiers.
 */
export type SubscriptionTier = "FREE" | "PRO" | "ENTERPRISE";

/**
 * Resource Quota definitions.
 */
export interface QuotaConfig {
  /** Max rate limit (req/min) */
  rateLimit: number;
  /** Max storage in bytes (e.g. 500MB for Free) */
  storageLimit: number;
  /** Monthly email quota */
  emailQuota: number;
  /** AI tokens or executions */
  computeQuota: number;
}

/**
 * Global Plan Configuration.
 * Defines the capabilities and limits for each subscription tier.
 */
export const TIER_CONFIG: Record<SubscriptionTier, QuotaConfig> = {
  FREE: {
    rateLimit: 60,
    storageLimit: 500 * 1024 * 1024, // 500MB
    emailQuota: 100,
    computeQuota: 1000,
  },
  PRO: {
    rateLimit: 300,
    storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
    emailQuota: 5000,
    computeQuota: 50000,
  },
  ENTERPRISE: {
    rateLimit: 1000,
    storageLimit: 100 * 1024 * 1024 * 1024, // 100GB
    emailQuota: 100000,
    computeQuota: 1000000,
  },
};
