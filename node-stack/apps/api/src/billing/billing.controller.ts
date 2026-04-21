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

import { BillingService } from "./billing.service.js";
import { CreateCheckoutDto } from "@node-stack/validators";
import { CurrentUser } from "../auth/decorators/index.js";
import { RequirePermissions } from "../common/decorators/permissions.decorator.js";
import { Public } from "../common/decorators/public.decorator.js";
import { Workspace } from "../common/decorators/workspace.decorator.js";
import { IdempotencyGuard } from "../common/guards/idempotency.guard.js";
import { IdempotencyInterceptor } from "../common/interceptors/idempotency.interceptor.js";
import { UserPayload, WorkspaceContext } from "../common/types/index.js";

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
    description: "Initializes a checkout session for the selected plan.",
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

  /**
   * Polar webhook listener.
   *
   * The raw body middleware (`express.raw()`) in `main.ts` ensures this
   * endpoint receives a Buffer, which is required for Standard Webhooks
   * HMAC signature verification via `@polar-sh/sdk/webhooks`.
   */
  @SkipThrottle()
  @Public()
  @Post("webhook")
  @ApiOperation({
    summary: "Billing webhook listener",
    description:
      "Accepts events from Polar. Body must be raw for signature verification.",
  })
  @ApiResponse({ status: 200, description: "Webhook processed" })
  @ApiResponse({ status: 401, description: "Invalid signature" })
  async webhook(@Req() req: Request) {
    // req.body is a raw Buffer because of the express.raw() middleware
    // Pass the full headers object for Standard Webhooks verification
    // (webhook-id, webhook-timestamp, webhook-signature)
    const rawBody: Buffer | string = req.body;
    const headers = req.headers as Record<string, string>;

    const event = await this.billing.handleWebhook(rawBody, headers);

    return { received: true, eventId: event.id, type: event.type };
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
    return this.billing.portal(workspace.id);
  }

  @Get("invoices")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get invoices" })
  async invoices(@Workspace() workspace: WorkspaceContext) {
    return this.billing.invoices(workspace.id);
  }
}
