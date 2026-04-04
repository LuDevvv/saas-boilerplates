/**
 * Centralized definition of service tiers and their respective limits.
 * Used for rate-limiting, feature gating, and usage quotas.
 */
export const SERVICE_TIERS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

/**
 * Global rate limit configuration per tier (Requests per Minute).
 */
export const TIER_LIMITS = {
  [SERVICE_TIERS.FREE]: 60,
  [SERVICE_TIERS.PRO]: 600,
  [SERVICE_TIERS.ENTERPRISE]: 3000,
} as const;

/**
 * Identity of the Plan IDs as they appear in the Payment Provider (Polar.sh).
 * Maps a Price/Product ID to a Tier.
 */
export const PLAN_TO_TIER: Record<string, string> = {
  // Add your Polar Product IDs here:
  // "prod_123": SERVICE_TIERS.PRO,
};

export type ServiceTier = (typeof SERVICE_TIERS)[keyof typeof SERVICE_TIERS];
