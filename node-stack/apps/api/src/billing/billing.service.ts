import { createHmac } from "crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PolarProvider } from "@node-stack/billing-adapter";
import type { CheckoutUrl, WebhookEvent } from "@node-stack/billing-adapter";

import type { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { OutboxService } from "../common/services/outbox.service";

@Injectable()
export class BillingService {
  private polarProvider: PolarProvider;

  constructor(
    private configService: ConfigService,
    private outbox: OutboxService,
  ) {
    this.polarProvider = new PolarProvider(
      this.configService.get("POLAR_ACCESS_TOKEN") ?? "",
      this.configService.get("POLAR_WEBHOOK_SECRET"),
    );
  }

  async createCheckout(
    data: CreateCheckoutDto & { workspaceId: string; userId: string },
  ): Promise<CheckoutUrl> {
    // Create checkout on Polar
    const checkout = await this.polarProvider.createCheckoutSession({
      planId: data.planId,
      ...(data.variantId ? { variantId: data.variantId } : {}),
      ...(data.customerId ? { customerId: data.customerId } : {}),
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      metadata: {
        workspace_id: data.workspaceId,
        user_id: data.userId,
      },
    });

    // Write outbox event atomically
    await this.outbox.transaction(async (tx) => {
      await this.outbox.createEvent("checkout.created", {
        checkoutUrl: checkout.url,
        workspaceId: data.workspaceId,
        userId: data.userId,
        expiresAt: checkout.expiresAt,
      }, tx);
    });

    return checkout;
  }

  async verifyWebhook(
    headers: Record<string, string>,
    rawBody: string,
  ): Promise<WebhookEvent> {
    const signature = headers["polar-signature"] || headers["x-polar-signature"] || "";
    const secret = this.configService.get("POLAR_WEBHOOK_SECRET");

    if (secret && signature) {
      const expected = createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      if (signature !== expected) {
        throw new UnauthorizedException("Invalid webhook signature");
      }
    }

    return this.polarProvider.handleWebhook(JSON.parse(rawBody));
  }

  async getSubscription(workspaceId: string) {
    return { status: "active", workspaceId };
  }

  async portal(_opts: unknown) {
    return { url: "https://polar.sh/customer-portal" };
  }

  async invoices(_opts: unknown) {
    return { invoices: [] };
  }
}
