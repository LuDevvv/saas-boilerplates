import { createHmac, timingSafeEqual } from "crypto";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type {
  InboundWebhookHandler,
  TransformedWebhookEvent,
} from "@/webhooks/interfaces/webhook-handler.interface.js";

/**
 * Generic Webhook Handler.
 *
 * Handles webhooks from any provider that uses standard HMAC-SHA256
 * signing with a shared secret. The signature is expected in either:
 *   - `x-webhook-signature` header
 *   - `x-signature` header
 *   - `x-hub-signature-256` header (GitHub-style: "sha256=<hex>")
 *
 * Payload format: `${timestamp}.${rawBody}` (if timestamp header exists)
 *                 or just `${rawBody}` (for simple HMAC)
 *
 * This serves as a template for quickly integrating new providers.
 * For production use, create a dedicated handler per provider.
 */
@Injectable()
export class GenericWebhookHandler implements InboundWebhookHandler {
  readonly provider = "generic";

  private readonly logger = new Logger(GenericWebhookHandler.name);
  private readonly webhookSecret: string;

  constructor(private readonly config: ConfigService) {
    this.webhookSecret = this.config.get<string>("GENERIC_WEBHOOK_SECRET", "");
  }

  async validateSignature(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): Promise<boolean> {
    if (!this.webhookSecret) {
      this.logger.warn("GENERIC_WEBHOOK_SECRET not set — rejecting");
      return false;
    }

    // Try multiple common signature header patterns
    const signatureHeader =
      headers["x-webhook-signature"] ??
      headers["x-signature"] ??
      headers["x-hub-signature-256"];

    if (!signatureHeader) {
      return false;
    }

    try {
      // Handle "sha256=<hex>" format (GitHub-style)
      const signature = signatureHeader.startsWith("sha256=")
        ? signatureHeader.slice(7)
        : signatureHeader;

      // Check if there's a timestamp header for replay protection
      const timestamp =
        headers["x-webhook-timestamp"] ?? headers["x-timestamp"];

      const signedContent = timestamp
        ? `${timestamp}.${rawBody.toString("utf8")}`
        : rawBody.toString("utf8");

      const computed = createHmac("sha256", this.webhookSecret)
        .update(signedContent, "utf8")
        .digest("hex");

      const a = Buffer.from(computed, "hex");
      const b = Buffer.from(signature, "hex");

      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch (err: any) {
      this.logger.error(`Generic signature validation error: ${err.message}`);
      return false;
    }
  }

  extractEventId(rawBody: Buffer, headers: Record<string, string>): string {
    // Try common ID headers first
    const headerId =
      headers["x-webhook-id"] ??
      headers["x-event-id"] ??
      headers["x-request-id"];

    if (headerId) return headerId;

    try {
      const parsed = JSON.parse(rawBody.toString("utf8"));
      return parsed.id ?? parsed.event_id ?? `generic-${Date.now()}`;
    } catch {
      return `generic-${Date.now()}`;
    }
  }

  extractEventType(rawBody: Buffer, headers: Record<string, string>): string {
    const headerType =
      headers["x-webhook-event"] ?? headers["x-event-type"];

    if (headerType) return headerType;

    try {
      const parsed = JSON.parse(rawBody.toString("utf8"));
      return parsed.type ?? parsed.event ?? parsed.event_type ?? "unknown";
    } catch {
      return "unknown";
    }
  }

  async transformEvent(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): Promise<TransformedWebhookEvent> {
    const parsed = JSON.parse(rawBody.toString("utf8"));
    const eventId = this.extractEventId(rawBody, headers);
    const eventType = this.extractEventType(rawBody, headers);

    return {
      internalEventName: `webhook.generic.${eventType}`,
      providerEventType: eventType,
      providerEventId: eventId,
      provider: this.provider,
      payload: parsed,
    };
  }
}
