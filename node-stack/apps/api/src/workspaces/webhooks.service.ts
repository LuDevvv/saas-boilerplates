import { Injectable, NotFoundException } from "@nestjs/common";
import { db, schema, eq, and, desc } from "@node-stack/db";
import { randomUUID } from "node:crypto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class WebhooksService {
  constructor(@InjectQueue("webhooks.delivery") private deliveryQueue: Queue) {}

  async create(workspaceId: string, data: { url: string; eventTypes: string[] }) {
    const secret = `whsec_${randomUUID().replace(/-/g, "")}`;
    const [endpoint] = await db
      .insert(schema.webhookEndpoints)
      .values({
        id: randomUUID(),
        workspaceId,
        url: data.url,
        secret,
        eventTypes: data.eventTypes,
      })
      .returning();
    
    return endpoint;
  }

  async list(workspaceId: string) {
    return db.query.webhookEndpoints.findMany({
      where: eq(schema.webhookEndpoints.workspaceId, workspaceId),
      orderBy: [desc(schema.webhookEndpoints.createdAt)],
    });
  }

  async delete(workspaceId: string, endpointId: string) {
    const [deleted] = await db
      .delete(schema.webhookEndpoints)
      .where(
        and(
          eq(schema.webhookEndpoints.id, endpointId),
          eq(schema.webhookEndpoints.workspaceId, workspaceId)
        )
      )
      .returning();
    
    if (!deleted) throw new NotFoundException("Webhook endpoint not found");
    return deleted;
  }

  async getDeliveries(workspaceId: string, endpointId: string) {
    // Verify endpoint belongs to workspace
    const endpoint = await db.query.webhookEndpoints.findFirst({
      where: and(
        eq(schema.webhookEndpoints.id, endpointId),
        eq(schema.webhookEndpoints.workspaceId, workspaceId)
      ),
    });

    if (!endpoint) throw new NotFoundException("Webhook endpoint not found");

    return db.query.webhookDeliveries.findMany({
      where: eq(schema.webhookDeliveries.endpointId, endpointId),
      orderBy: [desc(schema.webhookDeliveries.createdAt)],
      limit: 50,
    });
  }

  async test(workspaceId: string, endpointId: string) {
    const endpoint = await db.query.webhookEndpoints.findFirst({
      where: and(
        eq(schema.webhookEndpoints.id, endpointId),
        eq(schema.webhookEndpoints.workspaceId, workspaceId)
      ),
    });

    if (!endpoint) throw new NotFoundException("Webhook endpoint not found");

    const payload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      message: "This is a test webhook from NodeStack",
    };

    await this.deliveryQueue.add("deliver", {
      endpointId: endpoint.id,
      payload,
      eventType: "webhook.test",
    });

    return { message: "Test webhook enqueued" };
  }
}
