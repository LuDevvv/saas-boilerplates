import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Req,
  Res,
  HttpCode,
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

import { Public } from "@/common/decorators/public.decorator.js";
import { InboundWebhookService } from "@/webhooks/webhooks.service.js";

@ApiTags("webhooks")
@Controller("webhooks")
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhookService: InboundWebhookService) {}


  /**
   * Universal webhook receiver for external providers.
   * Validates signatures and ensures 200 OK to prevent retry storms.
   */
  @SkipThrottle()
  @Public()
  @Post(":provider")
  @HttpCode(200)
  @ApiOperation({
    summary: "Receive inbound webhook",
    description:
      "Universal endpoint for receiving webhooks from external providers (Stripe, Polar, Clerk, etc.). " +
      "Validates signatures, deduplicates, and emits normalised events on the internal bus.",
  })
  @ApiParam({
    name: "provider",
    description: "The webhook provider (e.g. stripe, polar, clerk, generic)",
    example: "stripe",
  })
  @ApiResponse({ status: 200, description: "Webhook received and processed" })
  @ApiResponse({ status: 401, description: "Invalid webhook signature" })
  @ApiResponse({ status: 404, description: "Unknown webhook provider" })
  async receiveWebhook(
    @Param("provider") provider: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const rawBody = req.body as Buffer;
    const headers = req.headers as Record<string, string>;
    const sourceIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.ip;

    const normalizedProvider = provider.toLowerCase().trim();

    const result = await this.webhookService.processWebhook(
      normalizedProvider,
      rawBody,
      headers,
      sourceIp,
    );

    return res.status(result.status).json({
      received: true,
      eventId: result.eventId,
      message: result.message,
    });
  }


  @Throttle({ medium: { ttl: 60000, limit: 30 } })
  @Get("logs/recent")
  @ApiOperation({
    summary: "List recent webhook logs",
    description:
      "Returns recent inbound webhook logs for debugging. Requires authentication.",
  })
  @ApiQuery({
    name: "provider",
    required: false,
    description: "Filter by provider",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of logs to return (default: 50)",
    type: Number,
  })
  @ApiResponse({ status: 200, description: "Recent webhook logs" })
  async getRecentLogs(
    @Query("provider") provider?: string,
    @Query("limit") limit?: string,
  ): Promise<unknown> {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.webhookService.getRecentLogs(provider, parsedLimit);
  }

  @Throttle({ medium: { ttl: 60000, limit: 30 } })
  @Get("logs/failed")
  @ApiOperation({
    summary: "List failed webhook logs",
    description:
      "Returns failed/rejected webhook logs for investigation and potential replay.",
  })
  @ApiQuery({
    name: "provider",
    required: false,
    description: "Filter by provider",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of logs to return (default: 50)",
    type: Number,
  })
  @ApiResponse({ status: 200, description: "Failed webhook logs" })
  async getFailedLogs(
    @Query("provider") provider?: string,
    @Query("limit") limit?: string,
  ): Promise<unknown> {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.webhookService.getFailedLogs(provider, parsedLimit);
  }

  @Get("logs/:id")
  @ApiOperation({
    summary: "Get webhook log by ID",
    description: "Returns a single webhook log entry with full payload.",
  })
  @ApiParam({ name: "id", description: "The webhook log UUID" })
  @ApiResponse({ status: 200, description: "Webhook log details" })
  async getLogById(@Param("id") id: string): Promise<unknown> {
    return this.webhookService.getLogById(id);
  }

  @Get("providers")
  @ApiOperation({
    summary: "List registered webhook providers",
    description: "Returns the list of currently registered webhook provider handlers.",
  })
  @ApiResponse({ status: 200, description: "List of provider names" })
  async getProviders(): Promise<{ providers: string[] }> {
    return {
      providers: this.webhookService.getRegisteredProviders(),
    };
  }
}
