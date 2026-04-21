import { Controller, Get, Post, Body, Request } from "@nestjs/common";
import { AdminOnly } from "../../common/decorators/admin.decorator.js";
import { DynamicConfigService } from "../services/dynamic-config.service.js";
import { SetConfigSchema, type SetConfigDto } from "@node-stack/validators";
import { ZodValidationPipe } from "nestjs-zod";

@Controller("admin/config")
@AdminOnly()
export class ConfigAdminController {
  constructor(private dynamicConfigService: DynamicConfigService) {}

  @Get()
  async getAllConfig() {
    return this.dynamicConfigService.getAll();
  }

  @Post()
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
  async refreshCache() {
    await this.dynamicConfigService.warmCache();
    return { success: true };
  }
}
