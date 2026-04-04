import { Processor, WorkerHost, InjectQueue } from "@nestjs/bullmq";
import { Logger, OnModuleDestroy } from "@nestjs/common";
import { db, schema, eq, sql, desc } from "@node-stack/db";
import { generateWebhookSignature, formatWebhookHeader } from "@node-stack/webhooks-utils";
import { Job, Queue } from "bullmq";

@Processor("webhooks.delivery")
export class WebhookProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(@InjectQueue("webhooks.delivery") private jobQueue: Queue) {
    super();
  }

  async onModuleDestroy() {
    this.logger.log("[Worker] Webhook delivery processor shutting down...");
    await this.worker.close();
  }

  async process(job: Job<any>): Promise<void> {
    const { endpointId, payload } = job.data;

    const endpoint = await db.query.webhookEndpoints.findFirst({
      where: eq(schema.webhookEndpoints.id, endpointId),
    });

    if (!endpoint || !endpoint.enabled) {
      this.logger.warn(`Endpoint ${endpointId} not found or disabled`);
      return;
    }

    const signature = generateWebhookSignature(endpoint.secret, payload);
    const signatureHeader = formatWebhookHeader(signature);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let success = false;

    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      this.logger.error(`Webhook delivery to ${endpoint.url} error: ${error.message}`);
      responseBody = error.message;
    } finally {
      clearTimeout(timeoutId);
    }

    // Record delivery
    await db.insert(schema.webhookDeliveries).values({
      endpointId,
      payload,
      statusCode,
      responseBody,
      attempt: job.attemptsMade + 1,
      status: success ? "success" : "failed",
    });

    if (!success) {
      // Circuit Breaker logic: Check last 50 deliveries for CONSECUTIVE failures
      const lastDeliveries = await db.query.webhookDeliveries.findMany({
        where: eq(schema.webhookDeliveries.endpointId, endpointId),
        orderBy: [desc(schema.webhookDeliveries.createdAt)],
        limit: 50,
      });
      
      const allFailed = lastDeliveries.length >= 50 && lastDeliveries.every((d: any) => d.status === 'failed');
      
      if (allFailed) {
        await db.update(schema.webhookEndpoints)
          .set({ enabled: false })
          .where(eq(schema.webhookEndpoints.id, endpointId));
        
        this.logger.error(`Endpoint ${endpointId} disabled after 50 consecutive failures.`);
        
        // Trigger outbox event for disabled endpoint
        await db.insert(schema.outbox).values({
          eventType: "webhook.endpoint.disabled",
          payload: { 
            message: "Endpoint disabled due to 50 consecutive failures",
            endpointId, 
            workspaceId: endpoint.workspaceId 
          },
          workspaceId: endpoint.workspaceId,
        });
      }

      throw new Error(`Delivery failed with status ${statusCode}`);
    }
  }
}
