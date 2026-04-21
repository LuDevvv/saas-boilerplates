import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InboundWebhookRepository } from "@node-stack/db";

import type {
  InboundWebhookHandler,
  TransformedWebhookEvent,
} from "./interfaces/webhook-handler.interface.js";

/**
 * Orchestrates the full lifecycle of an inbound webhook:
 *
 *   1. Log the raw request immediately (audit trail)
 *   2. Route to the correct provider handler
 *   3. Validate the signature (HMAC, etc.)
 *   4. Check idempotency (skip duplicate events)
 *   5. Transform the event into a normalised internal format
 *   6. Emit on the internal EventEmitter2 bus
 *   7. Update the log with final status
 *
 * Providers register their handlers via the WEBHOOK_HANDLERS injection token.
 */
@Injectable()
export class InboundWebhookService {
  private readonly logger = new Logger(InboundWebhookService.name);
  private readonly handlers = new Map<string, InboundWebhookHandler>();

  constructor(
    private readonly webhookRepo: InboundWebhookRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Register a provider handler at startup.
   * Called by the module's `onModuleInit` lifecycle hook.
   */
  registerHandler(handler: InboundWebhookHandler): void {
    if (this.handlers.has(handler.provider)) {
      this.logger.warn(
        `Overwriting existing handler for provider: ${handler.provider}`,
      );
    }
    this.handlers.set(handler.provider, handler);
    this.logger.log(`Registered webhook handler: ${handler.provider}`);
  }

  /**
   * Returns which providers are currently registered.
   */
  getRegisteredProviders(): string[] {
    return Array.from(this.handlers.keys());
  }

  // ─── Main Ingestion Pipeline ───────────────────────────────────────────

  /**
   * Process an inbound webhook request end-to-end.
   *
   * @returns The HTTP status code to return to the provider
   */
  async processWebhook(
    provider: string,
    rawBody: Buffer,
    headers: Record<string, string>,
    sourceIp?: string,
  ): Promise<{ status: number; eventId?: string; message: string }> {
    const startTime = Date.now();

    // ── Step 1: Resolve handler ─────────────────────────────────────
    const handler = this.handlers.get(provider);
    if (!handler) {
      this.logger.warn(`No handler registered for provider: ${provider}`);
      throw new NotFoundException(
        `Webhook provider "${provider}" is not supported`,
      );
    }

    // ── Step 2: Extract identifiers (safe — no validation yet) ──────
    let providerEventId: string;
    let eventType: string;

    try {
      providerEventId = handler.extractEventId(rawBody, headers);
      eventType = handler.extractEventType(rawBody, headers);
    } catch (err: any) {
      this.logger.error(
        `Failed to extract event info from ${provider}: ${err.message}`,
      );
      providerEventId = `${provider}-extract-error-${Date.now()}`;
      eventType = "unknown";
    }

    // ── Step 3: Create audit log immediately ────────────────────────
    const sanitisedHeaders = this.sanitiseHeaders(headers);
    const log = await this.webhookRepo.create({
      provider: provider as any,
      providerEventId,
      eventType,
      headers: sanitisedHeaders,
      rawPayload: rawBody.toString("utf8"),
      status: "received",
      sourceIp: sourceIp ?? null,
    });

    // ── Step 4: Validate signature ──────────────────────────────────
    let signatureValid: boolean;
    try {
      signatureValid = await handler.validateSignature(rawBody, headers);
    } catch (err: any) {
      this.logger.error(
        `Signature validation threw for ${provider}/${providerEventId}: ${err.message}`,
      );
      signatureValid = false;
    }

    if (!signatureValid) {
      const duration = Date.now() - startTime;
      await this.webhookRepo.updateStatus(log.id, {
        status: "rejected",
        signatureValid: false,
        errorMessage: "Invalid webhook signature",
        responseStatus: 401,
        processingDurationMs: duration,
      });

      this.logger.warn(
        `Rejected ${provider} webhook ${providerEventId}: invalid signature`,
      );

      return {
        status: 401,
        message: "Invalid signature",
      };
    }

    // ── Step 5: Idempotency check ───────────────────────────────────
    const alreadyProcessed = await this.webhookRepo.isAlreadyProcessed(
      provider as any,
      providerEventId,
    );

    if (alreadyProcessed) {
      const duration = Date.now() - startTime;
      await this.webhookRepo.updateStatus(log.id, {
        status: "processed",
        signatureValid: true,
        responseStatus: 200,
        processingDurationMs: duration,
        errorMessage: "Duplicate event — already processed",
      });

      this.logger.log(
        `Skipping duplicate ${provider} event: ${providerEventId}`,
      );

      return {
        status: 200,
        eventId: providerEventId,
        message: "Already processed",
      };
    }

    // ── Step 6: Mark as validated ────────────────────────────────────
    await this.webhookRepo.updateStatus(log.id, {
      status: "validated",
      signatureValid: true,
    });

    // ── Step 7: Transform and emit ──────────────────────────────────
    let transformed: TransformedWebhookEvent;
    try {
      transformed = await handler.transformEvent(rawBody, headers);
    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Transform failed for ${provider}/${providerEventId}: ${err.message}`,
        err.stack,
      );

      await this.webhookRepo.updateStatus(log.id, {
        status: "failed",
        signatureValid: true,
        errorMessage: `Transform error: ${err.message}`,
        responseStatus: 200, // still ACK to avoid retries from provider
        processingDurationMs: duration,
        processingAttempts: 1,
      });

      // Return 200 to the provider — we have the raw payload stored for replay
      return {
        status: 200,
        eventId: providerEventId,
        message: "Accepted (processing error — queued for retry)",
      };
    }

    // ── Step 8: Emit events on internal bus ──────────────────────────
    try {
      // Emit the specific event (e.g. "billing.invoice.paid")
      this.eventEmitter.emit(transformed.internalEventName, transformed);

      // Also emit a wildcard event for global listeners
      this.eventEmitter.emit("webhook.received", transformed);

      this.logger.log(
        `Emitted ${transformed.internalEventName} from ${provider}/${providerEventId}`,
      );
    } catch (err: any) {
      this.logger.error(
        `EventEmitter error for ${transformed.internalEventName}: ${err.message}`,
      );
      // Non-fatal — the event was still received and logged
    }

    // ── Step 9: Mark as processed ───────────────────────────────────
    const duration = Date.now() - startTime;
    await this.webhookRepo.updateStatus(log.id, {
      status: "processed",
      signatureValid: true,
      internalEventName: transformed.internalEventName,
      parsedPayload: transformed.payload,
      responseStatus: 200,
      processingDurationMs: duration,
      processedAt: new Date(),
      processingAttempts: 1,
    });

    return {
      status: 200,
      eventId: providerEventId,
      message: "Processed",
    };
  }

  // ─── Query / Debug ────────────────────────────────────────────────────

  async getRecentLogs(provider?: string, limit?: number) {
    return this.webhookRepo.findRecent(provider as any, limit);
  }

  async getFailedLogs(provider?: string, limit?: number) {
    return this.webhookRepo.findFailed(provider as any, limit);
  }

  async getLogById(id: string) {
    return this.webhookRepo.findById(id);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  /**
   * Remove sensitive headers before persisting to the database.
   */
  private sanitiseHeaders(
    headers: Record<string, string>,
  ): Record<string, string> {
    const sensitiveKeys = [
      "authorization",
      "cookie",
      "set-cookie",
      "x-api-key",
      "x-auth-token",
    ];

    const sanitised: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        sanitised[key] = "[REDACTED]";
      } else {
        sanitised[key] = value;
      }
    }
    return sanitised;
  }
}
