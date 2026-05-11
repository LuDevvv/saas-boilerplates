import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from "@nestjs/swagger";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import type { CheckoutUrl, WebhookEventType } from "@node-stack/billing-adapter";
import { Permission } from "@node-stack/types";
import { CreateCheckoutDto, ChangePlanDto } from "@node-stack/validators";
import type { Request } from "express";

import { CurrentUser } from "@/auth/decorators/index.js";
import { BillingService } from "@/billing/billing.service.js";
import { PlanLimitsService } from "@/billing/plan-limits.service.js";
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
  constructor(
    private readonly billing: BillingService,
    private readonly planLimits: PlanLimitsService,
  ) {}

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
    @Req() req: Request,
  ): Promise<CheckoutUrl> {
    // Forward the dashboard's origin so Polar can allow the embedded iframe
    const embedOrigin = req.headers["origin"] as string | undefined;
    return this.billing.createCheckout({
      ...body,
      workspaceId: workspace.id,
      userId: user.id,
      embedOrigin,
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
  async webhook(@Req() req: Request): Promise<{ received: boolean; eventId: string; type: WebhookEventType }> {
    // req.body is a raw Buffer because of the express.raw() middleware
    // Pass the full headers object for Standard Webhooks verification
    // (webhook-id, webhook-timestamp, webhook-signature)
    const rawBody = req.body as Buffer | string;
    const headers = req.headers as Record<string, string>;

    const event = await this.billing.handleWebhook(rawBody, headers);

    return { received: true, eventId: event.id, type: event.type };
  }

  @Post("subscription/refresh")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Force-sync subscription state from Polar" })
  @ApiResponse({ status: 200, description: "Subscription refreshed" })
  async refreshSubscription(@Workspace() workspace: WorkspaceContext): Promise<Record<string, unknown>> {
    return this.billing.refreshSubscription(workspace.id);
  }

  @Get("subscription")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get subscription details" })
  @ApiResponse({ status: 200, description: "Subscription details retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async subscription(@Workspace() workspace: WorkspaceContext): Promise<Record<string, unknown>> {
    return this.billing.getSubscription(workspace.id);
  }

  @Get("portal")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get customer portal link (section: subscriptions | orders)" })
  @ApiResponse({ status: 200, description: "Customer portal link retrieved" })
  async portal(
    @Workspace() workspace: WorkspaceContext,
    @Query("section") section?: string,
  ): Promise<{ url: string | null }> {
    return this.billing.portal(workspace.id, section);
  }

  @Get("invoices")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get invoices via Polar Customer Session" })
  @ApiResponse({ status: 200, description: "Invoices retrieved" })
  async invoices(@Workspace() workspace: WorkspaceContext): Promise<Record<string, unknown>[]> {
    return this.billing.invoices(workspace.id);
  }

  @Post("subscription/reactivate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.BILLING_WRITE)
  @ApiOperation({ summary: "Reactivate a pending-cancellation subscription" })
  @ApiResponse({ status: 204, description: "Subscription reactivated" })
  async uncancelSubscription(
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    return this.billing.uncancelSubscription(workspace.id, user.id);
  }

  @Delete("subscription")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.BILLING_WRITE)
  @ApiOperation({ summary: "Cancel subscription at period end" })
  @ApiResponse({ status: 204, description: "Cancellation scheduled" })
  async cancelSubscription(
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    return this.billing.cancelSubscription(workspace.id, user.id);
  }

  @Patch("subscription")
  @RequirePermissions(Permission.BILLING_WRITE)
  @ApiOperation({ summary: "Upgrade or downgrade subscription plan" })
  @ApiResponse({ status: 200, description: "Plan changed" })
  async changePlan(
    @Body() body: ChangePlanDto,
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
  ): Promise<Record<string, unknown>> {
    return this.billing.changePlan(workspace.id, user.id, body.planId, body.variantId);
  }

  @Get("usage")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "Get plan usage snapshot for the workspace" })
  @ApiResponse({ status: 200, description: "Usage data" })
  async usage(@Workspace() workspace: WorkspaceContext): Promise<Record<string, unknown>> {
    return this.planLimits.getUsageSnapshot(workspace.id);
  }

  @Get("plans")
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: "List available plans" })
  @ApiResponse({ status: 200, description: "Plans retrieved" })
  async plans(): Promise<Record<string, unknown>[]> {
    return [
      {
        id: "pro",
        name: "Growth",
        description: "Para negocios que necesitan escalar con potencia.",
        priceMonthly: 29,
        priceYearly: 290,
        trialDays: 0,
        features: [
          "Proyectos ilimitados",
          "Analíticas avanzadas",
          "Soporte prioritario 24/7",
          "10 GB de almacenamiento",
          "Exportación de datos",
          "Acceso API",
        ],
      },
      {
        id: "elite",
        name: "Unlimited",
        description: "Infraestructura dedicada para organizaciones.",
        priceMonthly: 99,
        priceYearly: 990,
        trialDays: 0,
        features: [
          "Todo lo de Growth",
          "Infraestructura dedicada",
          "SLA del 99.99%",
          "Almacenamiento ilimitado",
          "Manager dedicado",
          "Integraciones personalizadas",
        ],
      },
    ];
  }
}
