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
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { CurrentUser } from "../auth/decorators";
import { FeatureFlag } from "../common/decorators/feature-flag.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Workspace } from "../common/decorators/workspace.decorator";
import { FeatureFlagGuard } from "../common/guards/feature-flag.guard";
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
    summary: "Create a subscription checkout session",
    description: "Initializes a Polar/Stripe checkout session for the selected plan. Supports multi-currency based on workspace region."
  })
  @ApiResponse({ status: 201, description: "Checkout URL generated successfully" })
  @ApiResponse({ status: 402, description: "Payment required - previous invoice pending" })
  @ApiResponse({ status: 403, description: "Insufficient billing permissions" })
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

  @Post("new-checkout")
  @FeatureFlag("new-checkout-flow")
  @UseGuards(FeatureFlagGuard)
  @RequirePermissions(Permission.BILLING_WRITE)
  @ApiOperation({ 
    summary: "Experimental checkout flow",
    description: "New checkout experience guarded by feature flags. Only visible if 'new-checkout-flow' is enabled."
  })
  async newCheckout(
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

  // Public webhook — no auth, no guards
  @SkipThrottle()
  @Public()
  @Post("webhook")
  @UseGuards() // Override global guards
  @ApiOperation({ 
    summary: "Handle Polar/Billing webhooks",
    description: "Endpoint for receiving asynchronous events from the billing provider (Polar/Stripe). Requires valid signature."
  })
  @ApiResponse({ status: 200, description: "Event accepted and being processed" })
  @ApiResponse({ status: 401, description: "Invalid webhook signature" })
  async webhook(
    @Req() req: Request,
    @Headers("polar-signature") signature: string,
  ) {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString()
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);
    return this.billing.verifyWebhook(
      { "polar-signature": signature },
      rawBody,
    );
  }

  @Get("subscription")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ 
    summary: "Get active subscription details",
    description: "Returns the current plan, status (active, trialing, past_due), and next billing cycle date."
  })
  @ApiResponse({ status: 200, description: "Subscription details retrieved" })
  async subscription(@Workspace() workspace: WorkspaceContext) {
    return this.billing.getSubscription(workspace.id);
  }

  @Get("portal")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ 
    summary: "Generate customer portal link",
    description: "Returns a secure URL for the user to manage their payment methods, invoices, and plan changes directly on the provider portal."
  })
  @ApiResponse({ status: 200, description: "Portal URL generated" })
  async portal() {
    return this.billing.portal({});
  }

  @Get("invoices")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ 
    summary: "List historical invoices",
    description: "Retrieves a chronologically ordered list of all invoices and receipts for the workspace."
  })
  @ApiResponse({ status: 200, description: "Invoice list retrieved" })
  async invoices() {
    return this.billing.invoices({});
  }
}
