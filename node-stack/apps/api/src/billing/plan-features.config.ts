/**
 * Plan feature definitions for the boilerplate.
 *
 * This file is the single source of truth for what each plan includes.
 * Limits are enforced by PlanLimitsService at the service layer — Polar
 * handles billing, YOUR code handles access control.
 *
 * To adapt for a specific product (e.g. DR accounting software):
 *  - Rename plans (e.g. emprendedor / pyme / empresarial)
 *  - Adjust numeric limits per plan
 *  - Add domain-specific feature flags (e.g. hasNomina, hasEFactura)
 *  - Wire Polar meter slugs after creating meters in your Polar dashboard
 */

export type PlanFeatureKey =
  | "apiAccess"
  | "advancedAnalytics"
  | "prioritySupport"
  | "customIntegrations"
  | "auditLogs"
  | "multiWorkspace"
  | "exportData"
  | "webhooks";

export interface PlanFeatures {
  // ── Resource limits (null = unlimited) ─────────────────────────────────────
  /** Max workspaces/companies the user can own */
  maxWorkspaces: number | null;
  /** Max members per workspace */
  maxMembersPerWorkspace: number | null;
  /** Max monthly API calls across the workspace */
  maxApiCallsPerMonth: number | null;
  /** Max total storage in MB */
  maxStorageMb: number | null;

  // ── Feature flags ───────────────────────────────────────────────────────────
  features: Record<PlanFeatureKey, boolean>;

  // ── Polar meter slugs ───────────────────────────────────────────────────────
  /**
   * After creating meters in the Polar dashboard (or via the setup script),
   * set the slug for each meter so usage is automatically reported.
   * Leave undefined to skip reporting for that metric.
   */
  meters: {
    /** API request counter meter slug */
    apiCalls?: string;
    /** Active users gauge meter slug */
    activeUsers?: string;
    /** Storage consumption meter slug */
    storageMb?: string;
  };
}

// ─── Plan catalog ─────────────────────────────────────────────────────────────

export const FREE_PLAN_ID = "free";

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  [FREE_PLAN_ID]: {
    maxWorkspaces: 1,
    maxMembersPerWorkspace: 1,
    maxApiCallsPerMonth: 500,
    maxStorageMb: 100,
    features: {
      apiAccess: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customIntegrations: false,
      auditLogs: false,
      multiWorkspace: false,
      exportData: false,
      webhooks: false,
    },
    meters: {},
  },

  // ── Growth / Pro ────────────────────────────────────────────────────────────
  pro: {
    maxWorkspaces: 1,
    maxMembersPerWorkspace: 25,
    maxApiCallsPerMonth: 10_000,
    maxStorageMb: 10_240, // 10 GB
    features: {
      apiAccess: true,
      advancedAnalytics: true,
      prioritySupport: false,
      customIntegrations: false,
      auditLogs: true,
      multiWorkspace: false,
      exportData: true,
      webhooks: false,
    },
    meters: {
      apiCalls: "api_calls",
    },
  },

  // ── Unlimited / Elite ───────────────────────────────────────────────────────
  elite: {
    maxWorkspaces: null,
    maxMembersPerWorkspace: null,
    maxApiCallsPerMonth: null,
    maxStorageMb: null,
    features: {
      apiAccess: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customIntegrations: true,
      auditLogs: true,
      multiWorkspace: true,
      exportData: true,
      webhooks: true,
    },
    meters: {
      apiCalls: "api_calls",
      activeUsers: "active_users",
      storageMb: "storage_mb",
    },
  },
};

/** Returns the feature set for a given plan. Falls back to free plan for unknown plans. */
export function getPlanFeatures(planId: string | null | undefined): PlanFeatures {
  return PLAN_FEATURES[planId ?? FREE_PLAN_ID] ?? PLAN_FEATURES[FREE_PLAN_ID]!;
}

/** Returns true if the plan has access to a specific feature. */
export function planHasFeature(
  planId: string | null | undefined,
  feature: PlanFeatureKey,
): boolean {
  return getPlanFeatures(planId).features[feature] === true;
}
