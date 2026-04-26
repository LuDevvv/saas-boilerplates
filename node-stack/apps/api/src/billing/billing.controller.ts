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
  ApiHeader,
} from "@nestjs/swagger";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { Permission } from "@node-stack/types";
import { CreateCheckoutDto } from "@node-stack/validators";
import type { Request } from "express";

import { CurrentUser } from "@/auth/decorators/index.js";
import { BillingService } from "@/billing/billing.service.js";
import { Idempotent } from "@/common/decorators/idempotent.decorator.js";
import { RequirePermissions } from "@/common/decorators/permissions.decorator.js";
import { Public } from "@/common/decorators/public.decorator.js";
import { Workspace } from "@/common/decorators/workspace.decorator.js";
import type { UserPayload, WorkspaceContext } from "@/common/types/index.js";

@ApiTags("billing")
@ApiBearerAuth("JWT-auth")
@ApiHeader({
  name: "x-workspace-id",
  description: "The ID of the workspace context",
  required: true,
})
@Idempotent()
@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Throttle({ medium: { ttl: 60000, limit: 5 } })
  @Post("checkout")
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
  @ApiResponse({ status: 200, description: "Subscription details retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async subscription(@Workspace() workspace: WorkspaceContext) {
    return this.billing.getSubscription(workspace.id);
  }

  @Get("portal")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get customer portal link" })
  @ApiResponse({ status: 200, description: "Customer portal link retrieved" })
  async portal(@Workspace() workspace: WorkspaceContext) {
    return this.billing.portal(workspace.id);
  }

  @Get("invoices")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get invoices" })
  @ApiResponse({ status: 200, description: "Invoices retrieved" })
  async invoices(@Workspace() workspace: WorkspaceContext) {
    return this.billing.invoices(workspace.id);
  }
}
