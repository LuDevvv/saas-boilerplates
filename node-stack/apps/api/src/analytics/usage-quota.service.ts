import { Injectable, ForbiddenException } from "@nestjs/common";

import { AnalyticsService } from "@/analytics/analytics.service.js";
import { DEFAULT_LIMITS, PlanType } from "@/analytics/usage.config.js";
import { BillingService } from "@/billing/billing.service.js";

@Injectable()
export class UsageQuotaService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly billingService: BillingService,
  ) {}

  async checkQuota(workspaceId: string, type: "ai" | "storage"): Promise<{
    allowed: boolean;
    plan: PlanType;
    limits: (typeof DEFAULT_LIMITS)[PlanType];
    usage: Awaited<ReturnType<AnalyticsService["getWorkspaceUsage"]>>;
  }> {
    const subscription = await this.billingService.getSubscription(workspaceId);

    // Default to free if no subscription or unknown plan
    const plan = (subscription.planId as PlanType) || "free";
    const limits = DEFAULT_LIMITS[plan] ?? DEFAULT_LIMITS.free;
    const usage = await this.analyticsService.getWorkspaceUsage(workspaceId);

    if (type === "ai") {
      const currentTokens = usage.ai.tokens.input + usage.ai.tokens.output;
      if (currentTokens >= limits.aiTokens) {
        throw new ForbiddenException(`AI Token quota exceeded for plan ${plan}. Upgrade to continue.`);
      }
    }

    if (type === "storage") {
      const currentStorage = usage.storage.totalBytes;
      if (currentStorage >= limits.storageBytes) {
        throw new ForbiddenException(`Storage quota exceeded for plan ${plan}. Upgrade to continue.`);
      }
    }

    return {
      allowed: true,
      plan,
      limits,
      usage,
    };
  }
}
