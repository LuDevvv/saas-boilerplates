import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  Headers,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { Permission } from "@node-stack/types";
import { Request } from "express";

import { BillingService } from "./billing.service";
import { CreateCheckoutDto } from "@node-stack/validators";
import { CurrentUser } from "../auth/decorators";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Workspace } from "../common/decorators/workspace.decorator";
import { IdempotencyGuard } from "../common/guards/idempotency.guard";
import { IdempotencyInterceptor } from "../common/interceptors/idempotency.interceptor";
import { UserPayload, WorkspaceContext } from "../common/types";

@ApiTags("billing")
@ApiBearerAuth("JWT-auth")
@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Throttle({ medium: { ttl: 60000, limit: 5 } })
  @Post("checkout")
  @UseGuards(IdempotencyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @RequirePermissions(Permission.BILLING_WRITE)
  @ApiOperation({ 
    summary: "Create checkout session",
    description: "Initializes a checkout session for the selected plan."
  })
  @ApiResponse({ status: 201, description: "Checkout URL generated" })
  async checkout(
    @Body() body: CreateCheckoutDto,
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
  ) {
    return this.billing.createCheckout({
      ...body,
      workspaceId: workspace.id,
      userId: user.id,
    });
  }

  @SkipThrottle()
  @Public()
  @Post("webhook")
  @ApiOperation({ 
    summary: "Billing webhook listener",
    description: "Accepts events from Polar or generic mock billing events."
  })
  async webhook(
    @Req() req: Request,
    @Headers("polar-signature") polarSignature?: string,
  ) {
    const signature = polarSignature;
    
    // Body is raw buffer due to middleware in main.ts
    return this.billing.handleWebhook(req.body, signature);
  }

  @Get("subscription")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get subscription details" })
  async subscription(@Workspace() workspace: WorkspaceContext) {
    return this.billing.getSubscription(workspace.id);
  }

  @Get("portal")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get customer portal link" })
  async portal(@Workspace() workspace: WorkspaceContext) {
    // We would fetch the customerId from our DB based on workspace.id
    const customerId = "cus_TODO"; 
    return this.billing.portal(customerId);
  }
}
