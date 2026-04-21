import { Processor, InjectQueue } from "@nestjs/bullmq";
import { Logger, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { db, schema, eq } from "@node-stack/db";
import { 
  generateWebhookSignature, 
  formatWebhookHeader,
  validateWebhookUrl 
} from "@node-stack/webhooks-utils";
import { Job, Queue } from "bullmq";
import { CacheService } from "@node-stack/cache";
import { EncryptionUtils } from "@node-stack/services";
import { BaseWorker } from "../base.worker.js";

@Processor("webhooks.delivery")
export class WebhookProcessor extends BaseWorker {
  protected readonly logger = new Logger(WebhookProcessor.name);
  protected readonly queueName = "webhooks.delivery";
  private readonly encryption: EncryptionUtils;

  constructor(
    @InjectQueue("webhooks.delivery") private jobQueue: Queue,
    @InjectQueue("dlq") private readonly dlqQueue: Queue,
    @Inject(CacheService) private readonly cacheService: CacheService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {
    super();
    this.encryption = new EncryptionUtils(this.config.get("ENCRYPTION_KEY"));
  }

  protected getDlqQueue(): Queue {
    return this.dlqQueue;
  }

  async processJob(job: Job<any>): Promise<void> {
    const { endpointId, payload } = job.data;

    const endpoint = await db.query.webhookEndpoints.findFirst({
      where: eq(schema.webhookEndpoints.id, endpointId),
    });

    if (!endpoint || !endpoint.enabled) {
      this.logger.warn(`Endpoint ${endpointId} not found or disabled. Skipping.`);
      return;
    }

    // SSRF PROTECTION: Validate URL and reject internal IPs
    const isUrlSafe = await validateWebhookUrl(endpoint.url);
    if (!isUrlSafe) {
      this.logger.error(`POTENTIAL SSRF REJECTED: Webhook endpoint ${endpointId} uses an unsafe URL: ${endpoint.url}`);
      
      // Auto-disable unsafe endpoints
      await db.update(schema.webhookEndpoints)
        .set({ enabled: false })
        .where(eq(schema.webhookEndpoints.id, endpointId));
      
      await db.insert(schema.webhookDeliveries).values({
        endpointId,
        payload,
        status: "failed",
        statusCode: 403,
        responseBody: "REJECTED: Unsafe/Private URL detected (SSRF prevention)",
        attempt: job.attemptsMade + 1,
      });

      return;
    }

    // Decrypt the secret if encryption is enabled
    const secret = this.encryption.decrypt(endpoint.secret);
    
    // Generate secure signature (v1 header format with timestamp)
    const signature = generateWebhookSignature(secret, payload);
    const signatureHeader = formatWebhookHeader(signature);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for stability

    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let success = false;

    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "NodeStack-Webhook-Dispatcher/1.0",
          "X-NodeStack-Signature": signatureHeader,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      statusCode = response.status;
      responseBody = await response.text();
      success = response.ok;

      this.logger.log(`Webhook delivery to ${endpoint.url}: ${statusCode} ${success ? "success" : "failed"}`);
    } catch (error: any) {
      const errorMsg = error.name === 'AbortError' ? "Request timeout (10s)" : error.message;
      this.logger.error(`Webhook delivery to ${endpoint.url} error: ${errorMsg}`);
      responseBody = errorMsg;
    } finally {
      clearTimeout(timeoutId);
    }

    // Record delivery attempt
    await db.insert(schema.webhookDeliveries).values({
      endpointId,
      payload,
      statusCode,
      responseBody: responseBody?.substring(0, 5000), // Truncate very long responses
      attempt: job.attemptsMade + 1,
      status: success ? "success" : "failed",
    });

    if (!success) {
      // Circuit Breaker logic
      await this.handleFailure(endpointId, endpoint.workspaceId, responseBody || "Unknown error", job.attemptsMade + 1);
      
      // Throw to trigger BullMQ retry logic
      throw new Error(`Delivery failed with status ${statusCode || 'NULL'}`);
    } else {
      // Reset failure counter on success
      await this.cacheService.del(`webhooks:failures:${endpointId}`);
    }
  }

  private async handleFailure(endpointId: string, workspaceId: string, error: string, attempt: number) {
    const failureKey = `webhooks:failures:${endpointId}`;
    const failures = await this.cacheService.get<number>(failureKey) || 0;
    const newFailures = failures + 1;
    
    if (newFailures >= 50) {
      await db.update(schema.webhookEndpoints)
        .set({ enabled: false })
        .where(eq(schema.webhookEndpoints.id, endpointId));
      
      await this.cacheService.del(failureKey);
      
      this.logger.error(`Endpoint ${endpointId} disabled after 50 consecutive failures.`);
      
      // Trigger Outbox for user notification
      await db.insert(schema.outbox).values({
        eventType: "webhook.endpoint.disabled",
        payload: { 
          message: "Endpoint disabled due to 50 consecutive failures",
          endpointId, 
          workspaceId 
        },
        workspaceId,
      });
    } else {
      await this.cacheService.set(failureKey, newFailures, 60 * 60 * 24 * 7); // 7 days TTL
    }

    // Real-time notification for developer dashboard
    await this.cacheService.publish(`internal_events:workspace:${workspaceId}`, {
      type: "webhook.delivery.failed",
      payload: { workspaceId, webhookId: endpointId, error, attempts: attempt },
    });
  }
}
