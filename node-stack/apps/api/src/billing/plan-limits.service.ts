import { Injectable, ForbiddenException, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BillingRepository, DB_TOKEN, withTenantTx, withSystemTx, schema } from "@node-stack/db";
import type { Database } from "@node-stack/db";
import { eq, count, sum, and } from "drizzle-orm"; // `and` used in assertWorkspaceLimit

import {
  getPlanFeatures,
  PLAN_FEATURES,
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
 *   await this.planLimits.assertMemberLimit(workspaceId);
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
    private readonly config: ConfigService,
  ) {}

  // ─── Plan slug resolution ─────────────────────────────────────────────────

  /**
   * Resolves a raw planId from the DB (which may be a Polar product UUID or
   * already a human-readable slug like "pro" / "elite") to the slug used in
   * PLAN_FEATURES. Returns null for unrecognized IDs → free plan fallback.
   */
  private resolvePlanSlug(rawPlanId: string | null | undefined): string | null {
    if (!rawPlanId) return null;
    if (rawPlanId in PLAN_FEATURES) return rawPlanId; // already a slug

    // Map Polar product UUIDs → slugs via env vars
    const candidates: Array<{ key: string; slug: string }> = [
      { key: "POLAR_PRODUCT_ID_PRO_MONTHLY", slug: "pro" },
      { key: "POLAR_PRODUCT_ID_PRO_YEARLY",  slug: "pro" },
      { key: "POLAR_PRODUCT_ID_PRO",         slug: "pro" },
      { key: "POLAR_PRODUCT_ID_ELITE_MONTHLY", slug: "elite" },
      { key: "POLAR_PRODUCT_ID_ELITE_YEARLY",  slug: "elite" },
      { key: "POLAR_PRODUCT_ID_ELITE",         slug: "elite" },
    ];
    for (const { key, slug } of candidates) {
      const id = this.config.get<string>(key);
      if (id && id === rawPlanId) return slug;
    }
    return null;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /** Resolve plan features for a workspace (falls back to free plan). */
  async getFeatures(workspaceId: string): Promise<PlanFeatures> {
    const sub = await withTenantTx(
      workspaceId,
      (tx) => this.billingRepo.findSubscriptionByWorkspaceId(workspaceId, tx),
      this.db,
    );
    const slug = this.resolvePlanSlug(sub?.planId ?? null);
    return getPlanFeatures(slug);
  }

  /** Get the resolved plan slug for a workspace. Returns null if no subscription. */
  async getPlanId(workspaceId: string): Promise<string | null> {
    const sub = await withTenantTx(
      workspaceId,
      (tx) => this.billingRepo.findSubscriptionByWorkspaceId(workspaceId, tx),
      this.db,
    );
    return this.resolvePlanSlug(sub?.planId ?? null);
  }

  // ─── Feature assertions ───────────────────────────────────────────────────

  async assertFeature(workspaceId: string, feature: PlanFeatureKey): Promise<void> {
    const plan = await this.getFeatures(workspaceId);
    if (!plan.features[feature]) {
      throw new ForbiddenException(
        "Tu plan actual no incluye esta función. Actualiza tu plan para continuar.",
      );
    }
  }

  async hasFeature(workspaceId: string, feature: PlanFeatureKey): Promise<boolean> {
    const plan = await this.getFeatures(workspaceId);
    return plan.features[feature] === true;
  }

  // ─── Numeric limit assertions ─────────────────────────────────────────────

  /**
   * Asserts the workspace can add more members (checks current count from DB).
   * Call BEFORE creating a new membership or sending an invitation.
   */
  async assertMemberLimit(workspaceId: string): Promise<void> {
    const [plan, currentCount] = await Promise.all([
      this.getFeatures(workspaceId),
      this.getMemberCount(workspaceId),
    ]);
    const limit = plan.maxMembersPerWorkspace;
    if (limit !== null && currentCount >= limit) {
      throw new ForbiddenException(
        `Tu plan permite hasta ${limit} miembro(s). Actualiza tu plan para agregar más colaboradores.`,
      );
    }
  }

  async assertApiCallLimit(workspaceId: string, currentCount: number): Promise<void> {
    const plan = await this.getFeatures(workspaceId);
    const limit = plan.maxApiCallsPerMonth;
    if (limit !== null && currentCount >= limit) {
      throw new ForbiddenException(
        `Alcanzaste el límite de ${limit.toLocaleString("es")} llamadas API de tu plan este mes. Actualiza tu plan para continuar.`,
      );
    }
  }

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
   * Always allows the very first workspace (no existing memberships).
   */
  async assertWorkspaceLimit(userId: string): Promise<void> {
    const memberships = await withSystemTx(async (tx) => {
      return tx
        .select({ workspaceId: schema.memberships.workspaceId })
        .from(schema.memberships)
        .where(
          and(
            eq(schema.memberships.userId, userId),
            eq(schema.memberships.role, "owner"),
          ),
        )
        .limit(10);
    }, this.db);

    if (memberships.length === 0) return; // First workspace — always allowed

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
   * Returns a full usage snapshot with real DB counts for all plan metrics.
   * Used by GET /billing/usage to power the UsageWidget.
   *
   * Displayed metrics:
   *   members  — team member count vs maxMembersPerWorkspace
   *   storage  — sum of uploaded file sizes (MB) vs maxStorageMb
   *
   * Workspace limit is enforced via assertWorkspaceLimit() but is NOT
   * displayed (Growth users are always at 1/1 which looks alarming but is normal).
   */
  async getUsageSnapshot(workspaceId: string, userId: string): Promise<{
    planId: string | null;
    features: Record<string, boolean>;
    metrics: Array<{
      key: string;
      label: string;
      used: number;
      limit: number | null;
      unit: string;
    }>;
  }> {
    const [plan, planId, memberCount, storageResult] = await Promise.all([
      this.getFeatures(workspaceId),
      this.getPlanId(workspaceId),
      this.getMemberCount(workspaceId),
      // Sum of uploaded file sizes in bytes → convert to MB below
      withTenantTx(workspaceId, (tx) =>
        tx
          .select({ totalBytes: sum(schema.files.size) })
          .from(schema.files)
          .where(eq(schema.files.workspaceId, workspaceId)),
        this.db,
      ),
    ]);

    void userId; // reserved — may be used for per-user metrics in the future

    const storageMbUsed = Math.round(Number(storageResult[0]?.totalBytes ?? 0) / (1024 * 1024));

    return {
      planId,
      features: plan.features as unknown as Record<string, boolean>,
      metrics: [
        {
          key: "members",
          label: "Miembros del equipo",
          used: memberCount,
          limit: plan.maxMembersPerWorkspace,
          unit: "miembros",
        },
        {
          key: "storage",
          label: "Almacenamiento",
          used: storageMbUsed,
          limit: plan.maxStorageMb,
          unit: "MB",
        },
      ],
    };
  }
}
