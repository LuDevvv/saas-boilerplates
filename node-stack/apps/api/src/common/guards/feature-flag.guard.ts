import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FeatureFlagService } from "@node-stack/config";

import type { WorkspaceContext, UserPayload } from "@/common/types/index.js";

export const FEATURE_FLAG_KEY = "feature-flag";

interface FeatureFlagRequest {
  workspace?: WorkspaceContext;
  user?: UserPayload;
}

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly flagService: FeatureFlagService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const flagKey = this.reflector.get<string>(
      FEATURE_FLAG_KEY,
      context.getHandler(),
    );
    if (!flagKey) return true;

    const req = context.switchToHttp().getRequest<FeatureFlagRequest>();
    const workspaceId = req.workspace?.id;
    const userId = req.user?.id;

    return this.flagService.isEnabled(flagKey, workspaceId, userId);
  }
}
