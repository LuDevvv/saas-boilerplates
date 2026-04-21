import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { WebhooksController } from "./webhooks.controller.js";
import { InboundWebhookService } from "./webhooks.service.js";
import { DatabaseModule } from "@node-stack/db";

// ─── Provider Handlers ──────────────────────────────────────────────────
import { GenericWebhookHandler } from "./providers/generic.handler.js";

/**
 * Webhooks Module — unified inbound webhook processing.
 *
 * Architecture overview:
 *
 *   POST /webhooks/:provider
 *        │
 *        ▼
 *   WebhooksController  →  InboundWebhookService
 *        │                        │
 *        │                 ┌──────┴──────┐
 *        │                 │   Handler   │  (StripeWebhookHandler, GenericWebhookHandler, etc.)
 *        │                 └──────┬──────┘
 *        │                        │
 *        │                  validate signature
 *        │                  check idempotency
 *        │                  transform → emit on EventEmitter2
 *        │                  log to inbound_webhook_logs
 *        ▼
 *   200 OK (always ACK to prevent provider retries)
 *
 * ## Adding a new provider
 *
 * 1. Create `src/webhooks/providers/<name>.handler.ts` implementing `InboundWebhookHandler`
 * 2. Add the provider to `webhookProviderEnum` in `packages/db/src/schema/inbound-webhooks.ts`
 * 3. Import and register the handler in this module's `onModuleInit`
 * 4. Add `PROVIDER_WEBHOOK_SECRET` to `.env.example`
 * 5. Add the raw body middleware path in `main.ts`
 *
 * That's it — zero changes to the controller or service.
 */
@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [WebhooksController],
  providers: [
    InboundWebhookService,
    GenericWebhookHandler,
  ],
  exports: [InboundWebhookService],
})
export class WebhooksModule implements OnModuleInit {
  private readonly logger = new Logger(WebhooksModule.name);

  constructor(
    private readonly webhookService: InboundWebhookService,
    private readonly genericHandler: GenericWebhookHandler,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    // ── Register all provider handlers ───────────────────────────────
    // Only register handlers whose secrets are configured.
    // This prevents 404s for providers that aren't set up yet.

    if (this.config.get<string>("GENERIC_WEBHOOK_SECRET")) {
      this.webhookService.registerHandler(this.genericHandler);
    } else {
      this.logger.log(
        "Generic webhook handler skipped (GENERIC_WEBHOOK_SECRET not set)",
      );
    }

    const providers = this.webhookService.getRegisteredProviders();
    this.logger.log(
      `Webhook module initialised with ${providers.length} provider(s): [${providers.join(", ")}]`,
    );
  }
}
