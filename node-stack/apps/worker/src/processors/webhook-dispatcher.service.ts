import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, Inject } from "@nestjs/common";
import { schema, eq, sql, and, DB_TOKEN, type Database } from "@node-stack/db";
import { Queue } from "bullmq";

@Injectable()
export class WebhookDispatcher {
  private readonly logger = new Logger(WebhookDispatcher.name);

  constructor(
    @InjectQueue("webhooks.delivery") private deliveryQueue: Queue,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  async dispatch(eventType: string, payload: Record<string, unknown>, workspaceId?: string) {
    if (!workspaceId) {
      this.logger.warn(`No workspaceId provided for event ${eventType}. Skipping webhook dispatch.`);
      return;
    }

    // Find all endpoints for this workspace that listen to this event type or '*'
    const endpoints = await this.db.query.webhookEndpoints.findMany({
      where: and(
        eq(schema.webhookEndpoints.workspaceId, workspaceId),
        eq(schema.webhookEndpoints.enabled, true),
        sql`${schema.webhookEndpoints.eventTypes} && ARRAY[${eventType}, '*']::text[]`
      ),
    });

    if (endpoints.length === 0) {
      this.logger.debug(`No active endpoints found for workspace ${workspaceId} and event ${eventType}.`);
      return;
    }

    this.logger.log(`Dispatching event ${eventType} to ${endpoints.length} endpoints in workspace ${workspaceId}.`);

    // Enqueue a job for each endpoint
    await Promise.all(
      endpoints.map((endpoint: any) =>
        this.deliveryQueue.add(
          "deliver-webhook",
          {
            endpointId: endpoint.id,
            payload,
          },
          {
            // The processor will handle the backoff/retries as defined in the queue options
            jobId: `webhook-${endpoint.id}-${Date.now()}`,
          },
        ),
      ),
    );
  }
}
