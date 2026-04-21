import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { BillingRepository, AiRepository } from "@node-stack/db";
import { PLAN_LIMITS, DEFAULT_PLAN } from "../config/plans.config.js";

@Injectable()
export class BillingGuard implements CanActivate {
  constructor(
    private readonly billingRepo: BillingRepository,
    private readonly aiRepo: AiRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    
    // In our app, workspace context is usually attached by a previous guard/middleware
    const workspaceId = req?.workspace?.id || req?.params?.workspaceId;

    if (!workspaceId) {
      // If no workspace context, we can't check billing easily here.
      // Usually, AI routes are workspace-scoped.
      return true;
    }

    // 1. Get current subscription
    const sub = await this.billingRepo.findSubscriptionByWorkspaceId(workspaceId);
    
    // We treat no subscription as 'free' plan for now, but in a strict app you might require one.
    const planId = sub?.planId || DEFAULT_PLAN;
    const status = sub?.status || 'active'; // Default to active if no sub record yet (free tier)

    if (status !== 'active' && status !== 'trialling') {
      throw new ForbiddenException("Active subscription required to use this feature.");
    }

    // 2. Check AI usage limits
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS[DEFAULT_PLAN];
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const usage = await this.aiRepo.getMonthlyUsage(workspaceId, startOfMonth);

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
