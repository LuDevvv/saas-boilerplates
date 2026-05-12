/**
 * Usage limits by plan slug.
 *
 * Plan slugs must match PLAN_FEATURES keys in plan-features.config.ts
 * and the values resolved by PlanLimitsService.resolvePlanSlug():
 *   "pro"   → Growth ($29/mo · $290/yr)
 *   "elite" → Unlimited ($99/mo · $990/yr)
 *   "free"  → fallback for workspaces with no active subscription (not sold in Polar)
 */
export const DEFAULT_LIMITS = {
  free: {
    aiTokens: 10_000,
    storageBytes: 100 * 1024 * 1024,          // 100 MB
    monthlyRequests: 1_000,
  },
  pro: {
    aiTokens: 500_000,
    storageBytes: 10 * 1024 * 1024 * 1024,    // 10 GB
    monthlyRequests: 50_000,
  },
  elite: {
    aiTokens: 100_000_000,
    storageBytes: 1024 * 1024 * 1024 * 1024,  // 1 TB (effectively unlimited)
    monthlyRequests: 10_000_000,
  },
};

export type PlanType = keyof typeof DEFAULT_LIMITS;
