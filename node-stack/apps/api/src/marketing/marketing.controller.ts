import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JoinWaitlistDto } from "@node-stack/validators";

import { Public } from "@/common/decorators/public.decorator.js";
import { MarketingService } from "@/marketing/marketing.service.js";

@ApiTags("marketing")
@Controller("marketing")
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
  ) {}

  @Public()
  @Post("waitlist")
  @ApiOperation({ summary: "Join the product waitlist" })
  @ApiResponse({ status: 201, description: "Successfully joined the waitlist" })
  @ApiResponse({ status: 400, description: "Invalid email or data" })
  @HttpCode(HttpStatus.CREATED)
  async joinWaitlist(@Body() dto: JoinWaitlistDto) {
    return this.marketingService.joinWaitlist(dto);
  }

  @Public()
  @Get("waitlist/count")
  @ApiOperation({ summary: "Get total waitlist count" })
  @ApiResponse({ status: 200, description: "Count retrieved" })
  async getWaitlistCount() {
    const count = await this.marketingService.getWaitlistCount();
    return { count };
  }
}
