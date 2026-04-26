import { Controller, Get, Post, Body, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SetConfigSchema, SetConfigDto } from "@node-stack/validators";
import { ZodValidationPipe } from "nestjs-zod";

import { DynamicConfigService } from "@/admin/services/dynamic-config.service.js";
import { AdminOnly } from "@/common/decorators/admin.decorator.js";

@ApiTags("admin-config")
@Controller("admin/config")
@AdminOnly()
export class ConfigAdminController {
  constructor(private dynamicConfigService: DynamicConfigService) {}

  @Get()
  @ApiOperation({ summary: "Get all dynamic configuration (Admin only)" })
  @ApiResponse({ status: 200, description: "Configuration retrieved" })
  async getAllConfig() {
    return this.dynamicConfigService.getAll();
  }

  @Post()
  @ApiOperation({ summary: "Set dynamic configuration (Admin only)" })
  @ApiResponse({ status: 201, description: "Configuration updated" })
  async setConfig(
    @Body(new ZodValidationPipe(SetConfigSchema)) data: SetConfigDto,
    @Request() req: any,
  ) {
    const adminId = req.user?.id;
    return this.dynamicConfigService.set(
      data.key,
      data.value,
      data.description,
      adminId,
    );
  }

  @Post("refresh")
  @ApiOperation({ summary: "Manually refresh configuration cache (Admin only)" })
  @ApiResponse({ status: 201, description: "Cache refreshed" })
  async refreshCache() {
    await this.dynamicConfigService.warmCache();
    return { success: true };
  }
}
