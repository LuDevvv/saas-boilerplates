export const DEFAULT_LIMITS = {
  free: {
    aiTokens: 10000,
    storageBytes: 100 * 1024 * 1024, // 100MB
    monthlyRequests: 1000,
  },
  pro: {
    aiTokens: 500000,
    storageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    monthlyRequests: 50000,
  },
  enterprise: {
    aiTokens: 10000000,
    storageBytes: 100 * 1024 * 1024 * 1024, // 100GB
    monthlyRequests: 1000000,
  },
};

export type PlanType = keyof typeof DEFAULT_LIMITS;
