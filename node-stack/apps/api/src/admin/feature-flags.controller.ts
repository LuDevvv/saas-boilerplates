import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { FeatureFlagService } from "@node-stack/config";

import { JwtAuthGuard } from "../auth/guards/jwt.guard.js";
import { AdminGuard } from "../common/guards/admin.guard.js";

@Controller("admin/feature-flags")
@UseGuards(JwtAuthGuard, AdminGuard)
export class FeatureFlagsAdminController {
  constructor(private readonly flagService: FeatureFlagService) {}

  @Post(":flagKey/enable")
  async enable(
    @Param("flagKey") flagKey: string,
    @Body()
    body: {
      scope?: "global" | "workspace" | "user";
      workspaceId?: string;
      userId?: string;
    },
  ) {
    const scope = (body?.scope ?? "global") as any;
    if (scope === "global") {
      await this.flagService.enable(flagKey, "global");
      return { enabled: true, scope: "global" };
    }
    if (scope === "workspace") {
      if (!body.workspaceId)
        throw new BadRequestException(
          "workspaceId is required for workspace scope",
        );
      await this.flagService.enable(flagKey, "workspace", body.workspaceId);
      return {
        enabled: true,
        scope: "workspace",
        workspaceId: body.workspaceId,
      };
    }
    if (scope === "user") {
      if (!body.userId)
        throw new BadRequestException("userId is required for user scope");
      await this.flagService.enable(flagKey, "user", body.userId);
      return { enabled: true, scope: "user", userId: body.userId };
    }
    throw new BadRequestException("Invalid scope");
  }

  @Post(":flagKey/disable")
  async disable(
    @Param("flagKey") flagKey: string,
    @Body()
    body: {
      scope?: "global" | "workspace" | "user";
      workspaceId?: string;
      userId?: string;
    },
  ) {
    const scope = (body?.scope ?? "global") as any;
    if (scope === "global") {
      await this.flagService.disable(flagKey, "global");
      return { disabled: true, scope: "global" };
    }
    if (scope === "workspace") {
      if (!body.workspaceId)
        throw new BadRequestException(
          "workspaceId is required for workspace scope",
        );
      await this.flagService.disable(flagKey, "workspace", body.workspaceId);
      return {
        disabled: true,
        scope: "workspace",
        workspaceId: body.workspaceId,
      };
    }
    if (scope === "user") {
      if (!body.userId)
        throw new BadRequestException("userId is required for user scope");
      await this.flagService.disable(flagKey, "user", body.userId);
      return { disabled: true, scope: "user", userId: body.userId };
    }
    throw new BadRequestException("Invalid scope");
  }
}
