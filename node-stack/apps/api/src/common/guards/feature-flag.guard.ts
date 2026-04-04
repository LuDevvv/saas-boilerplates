import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FeatureFlagService } from "@node-stack/config";

export const FEATURE_FLAG_KEY = "feature-flag";

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

    const req = context.switchToHttp().getRequest();
    const workspaceId = (req as any).workspace?.id;
    const userId = (req as any).user?.id;

    return this.flagService.isEnabled(flagKey, workspaceId, userId);
  }
}
