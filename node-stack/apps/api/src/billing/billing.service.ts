import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  PaymentProvider,
  CheckoutUrl,
  WebhookEvent,
} from "@node-stack/billing-adapter";

import { CreateCheckoutDto } from "@node-stack/validators";
import { OutboxService } from "../common/services/outbox.service";

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly outbox: OutboxService,
    @Inject("PAYMENT_PROVIDER") private readonly provider: PaymentProvider,
  ) {}

  async createCheckout(
    data: CreateCheckoutDto & { workspaceId: string; userId: string },
  ): Promise<CheckoutUrl> {
    const checkout = await this.provider.createCheckoutSession({
      planId: data.planId,
      variantId: data.variantId,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      metadata: {
        workspace_id: data.workspaceId,
        user_id: data.userId,
      },
    });

    await this.outbox.transaction(async (tx) => {
      await this.outbox.createEvent(
        "checkout.created",
        {
          checkoutUrl: checkout.url,
          workspaceId: data.workspaceId,
          userId: data.userId,
          expiresAt: checkout.expiresAt,
        },
        tx,
      );
    });

    return checkout;
  }

  async handleWebhook(payload: any, signature?: string): Promise<WebhookEvent> {
    try {
      const event = await this.provider.handleWebhook(payload, signature);
      
      if (event.processed) {
        this.logger.log(`Processing billing event: ${event.type} (${event.id})`);
        
        await this.outbox.transaction(async (tx) => {
          await this.outbox.createEvent(`billing.${event.type}`, event.data, tx);
        });
      }

      return event;
    } catch (err) {
      this.logger.error(`Webhook processing failed: ${err.message}`);
      throw new UnauthorizedException("Invalid webhook request");
    }
  }

  async getSubscription(workspaceId: string) {
    return { status: "active", workspaceId };
  }

  async portal(customerId: string) {
    return { url: "https://billing.provider.com/portal" };
  }

  async invoices(customerId: string) {
    return { invoices: [] };
  }
}
