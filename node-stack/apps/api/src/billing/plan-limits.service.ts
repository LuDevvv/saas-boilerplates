import { Injectable, ForbiddenException, Inject } from "@nestjs/common";
import { BillingRepository, DB_TOKEN, withTenantTx, withSystemTx, schema } from "@node-stack/db";
import type { Database } from "@node-stack/db";
import { eq, count } from "drizzle-orm";

import {
  getPlanFeatures,
  type PlanFeatureKey,
  type PlanFeatures,
} from "@/billing/plan-features.config.js";

/**
 * PlanLimitsService
 *
 * Enforces plan limits at the service layer. Inject into any service that needs
 * to gate access based on the workspace's subscription plan.
 *
 * Pattern:
 *   await this.planLimits.assertMemberLimit(workspaceId, currentCount);
 *   // proceed with the operation if no error is thrown
 *
 * All assertion methods throw ForbiddenException with a user-friendly Spanish
 * message when the limit is exceeded.
 */
@Injectable()
export class PlanLimitsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Database,
    private readonly billingRepo: BillingRepository,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /** Resolve plan features for a workspace (falls back to free plan). */
  async getFeatures(workspaceId: string): Promise<PlanFeatures> {
    const sub = await withTenantTx(
      workspaceId,
      (tx) => this.billingRepo.findSubscriptionByWorkspaceId(workspaceId, tx),
      this.db,
    );
    return getPlanFeatures(sub?.planId ?? null);
  }

  /** Get the current plan ID for a workspace. Returns null if no subscription. */
  async getPlanId(workspaceId: string): Promise<string | null> {
    const sub = await withTenantTx(
      workspaceId,
      (tx) => this.billingRepo.findSubscriptionByWorkspaceId(workspaceId, tx),
      this.db,
    );
    return sub?.planId ?? null;
  }

  // ─── Feature assertions ───────────────────────────────────────────────────

  /**
   * Throws ForbiddenException if the workspace's plan does not include the feature.
   *
   * Usage:
   *   await this.planLimits.assertFeature(workspaceId, "apiAccess");
   */
  async assertFeature(workspaceId: string, feature: PlanFeatureKey): Promise<void> {
    const plan = await this.getFeatures(workspaceId);
    if (!plan.features[feature]) {
      throw new ForbiddenException(
        "Tu plan actual no incluye esta función. Actualiza tu plan para continuar.",
      );
    }
  }

  /**
   * Returns true if the workspace's plan includes the feature (no exception).
   * Use this for conditional behavior rather than gating.
   */
  async hasFeature(workspaceId: string, feature: PlanFeatureKey): Promise<boolean> {
    const plan = await this.getFeatures(workspaceId);
    return plan.features[feature] === true;
  }

  // ─── Numeric limit assertions ─────────────────────────────────────────────

  /**
   * Asserts the workspace can add more members.
   * Call BEFORE creating a new membership.
   *
   * @param workspaceId  Target workspace
   * @param currentCount Current number of active members
   */
  async assertMemberLimit(workspaceId: string, currentCount: number): Promise<void> {
    const plan = await this.getFeatures(workspaceId);
    const limit = plan.maxMembersPerWorkspace;
    if (limit !== null && currentCount >= limit) {
      throw new ForbiddenException(
        `Tu plan permite hasta ${limit} miembro(s). Actualiza tu plan para agregar más colaboradores.`,
      );
    }
  }

  /**
   * Asserts the workspace has not exceeded its monthly API call quota.
   *
   * @param workspaceId  Target workspace
   * @param currentCount Current API calls this billing period
   */
  async assertApiCallLimit(workspaceId: string, currentCount: number): Promise<void> {
    const plan = await this.getFeatures(workspaceId);
    const limit = plan.maxApiCallsPerMonth;
    if (limit !== null && currentCount >= limit) {
      throw new ForbiddenException(
        `Alcanzaste el límite de ${limit.toLocaleString("es")} llamadas API de tu plan este mes. Actualiza tu plan para continuar.`,
      );
    }
  }

  /**
   * Asserts the workspace has not exceeded its storage quota.
   *
   * @param workspaceId  Target workspace
   * @param currentMb    Current storage used in MB
   */
  async assertStorageLimit(workspaceId: string, currentMb: number): Promise<void> {
    const plan = await this.getFeatures(workspaceId);
    const limit = plan.maxStorageMb;
    if (limit !== null && currentMb >= limit) {
      throw new ForbiddenException(
        `Alcanzaste el límite de almacenamiento (${limit.toLocaleString("es")} MB) de tu plan. Actualiza tu plan para continuar.`,
      );
    }
  }

  /**
   * Asserts the user can create another workspace.
   * Counts workspaces where the user is OWNER.
   *
   * @param userId Current user
   */
  async assertWorkspaceLimit(userId: string): Promise<void> {
    // Look up the user's primary workspace plan to determine limits
    // We use the first workspace they own to check plan limits
    const memberships = await withSystemTx(async (tx) => {
      return tx
        .select({ workspaceId: schema.memberships.workspaceId })
        .from(schema.memberships)
        .where(eq(schema.memberships.userId, userId))
        .limit(10);
    }, this.db);

    if (memberships.length === 0) return; // First workspace — always allowed

    // Determine the user's plan from their first workspace
    const primaryWorkspaceId = memberships[0]?.workspaceId;
    if (!primaryWorkspaceId) return;

    const plan = await this.getFeatures(primaryWorkspaceId);
    const limit = plan.maxWorkspaces;

    if (limit !== null && memberships.length >= limit) {
      throw new ForbiddenException(
        `Tu plan permite hasta ${limit} empresa(s). Actualiza tu plan para crear más compañías.`,
      );
    }
  }

  // ─── Usage queries ────────────────────────────────────────────────────────

  /**
   * Returns the current member count for a workspace.
   * Use this to display usage in the UI.
   */
  async getMemberCount(workspaceId: string): Promise<number> {
    const rows = await withTenantTx(workspaceId, async (tx) => {
      return tx
        .select({ count: count() })
        .from(schema.memberships)
        .where(eq(schema.memberships.workspaceId, workspaceId));
    }, this.db);
    return Number(rows[0]?.count ?? 0);
  }

  /**
   * Returns a full usage snapshot for a workspace — used to populate
   * the UsageWidget and for analytics.
   */
  async getUsageSnapshot(workspaceId: string): Promise<{
    members: { used: number; limit: number | null };
    planId: string | null;
    features: Record<string, boolean>;
  }> {
    const [plan, memberCount] = await Promise.all([
      this.getFeatures(workspaceId),
      this.getMemberCount(workspaceId),
    ]);

    return {
      members: { used: memberCount, limit: plan.maxMembersPerWorkspace },
      planId: await this.getPlanId(workspaceId),
      features: plan.features as unknown as Record<string, boolean>,
    };
  }
}
