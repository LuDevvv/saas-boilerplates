export interface PlanLimit {
  maxTokensPerMonth: number;
}

/** 
 * Maps Polar product/plan IDs to limits.
 * In a real app, these would come from the database or a more robust config system.
 */
export const PLAN_LIMITS: Record<string, PlanLimit> = {
  'free': {
    maxTokensPerMonth: 10000,
  },
  'pro': {
    maxTokensPerMonth: 1000000,
  },
};

export const DEFAULT_PLAN = 'free';
