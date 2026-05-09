import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import {
  AiRepository,
  BillingRepository,
  DB_TOKEN,
  withTenantTx,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";

import { PLAN_LIMITS, DEFAULT_PLAN } from "@/common/config/plans.config.js";

@Injectable()
export class BillingGuard implements CanActivate {
  constructor(
    private readonly billingRepo: BillingRepository,
    private readonly aiRepo: AiRepository,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ workspace?: { id?: string }; params?: { workspaceId?: string } }>();

    // In our app, workspace context is usually attached by a previous guard/middleware
    const workspaceId = req?.workspace?.id ?? req?.params?.workspaceId;

    if (!workspaceId) {
      return true;
    }

    // subscriptions is RLS-protected; the read must run inside a tenant
    // tx so the GUC matches the policy. ai_logs is not RLS-protected
    // today, but co-locating both reads inside one tx keeps the guard
    // call shape consistent and avoids a second round trip.
    const { sub, usage } = await withTenantTx(
      workspaceId,
      async (tx) => {
        const sub = await this.billingRepo.findSubscriptionByWorkspaceId(workspaceId, tx);
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const usage = await this.aiRepo.getMonthlyUsage(workspaceId, startOfMonth);
        return { sub, usage };
      },
      this.db,
    );

    const planId = sub?.planId || DEFAULT_PLAN;
    const status = sub?.status || 'active';

    if (status !== 'active' && status !== 'trialling') {
      throw new ForbiddenException("Active subscription required to use this feature.");
    }

    const limits = PLAN_LIMITS[planId] ?? PLAN_LIMITS[DEFAULT_PLAN]!;

    if (usage >= limits.maxTokensPerMonth) {
      throw new ForbiddenException(
        `AI usage limit reached for your ${planId.toUpperCase()} plan. ` +
        `Current usage: ${usage.toLocaleString()} / Limit: ${limits.maxTokensPerMonth.toLocaleString()} tokens. ` +
        `Please upgrade your subscription to continue.`
      );
    }

    return true;
  }
}
