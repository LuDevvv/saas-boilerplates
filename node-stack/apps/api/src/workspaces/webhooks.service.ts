import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { db, schema, eq, and, desc } from "@node-stack/db";
import { validateWebhookUrl } from "@node-stack/webhooks-utils";
import { randomUUID } from "node:crypto";
import { JobService } from "../common/queues/job.service";
import { EncryptionService } from "../common/services/encryption.service";

@Injectable()
export class WebhooksService {
  constructor(
    private readonly jobService: JobService,
    private readonly encryption: EncryptionService,
  ) {}

  async create(workspaceId: string, data: { url: string; eventTypes: string[] }) {
    // SSRF PROTECTION: Validate URL during creation
    const isUrlSafe = await validateWebhookUrl(data.url);
    if (!isUrlSafe) {
      throw new BadRequestException("Invalid or unsafe URL provided (SSRF prevention)");
    }

    const rawSecret = `whsec_${randomUUID().replace(/-/g, "")}`;
    const encryptedSecret = this.encryption.encrypt(rawSecret);

    const [endpoint] = await db
      .insert(schema.webhookEndpoints)
      .values({
        id: randomUUID(),
        workspaceId,
        url: data.url,
        secret: encryptedSecret,
        eventTypes: data.eventTypes,
      })
      .returning();
    
    // Return raw secret ONLY ONCE on creation for the user to copy
    return {
      ...endpoint,
      secret: rawSecret, 
    };
  }

  async list(workspaceId: string) {
    const endpoints = await db.query.webhookEndpoints.findMany({
      where: eq(schema.webhookEndpoints.workspaceId, workspaceId),
      // Wait, the previous code had where: eq(endpoints.workspaceId, workspaceId)
    });
    
    // Re-check original list logic to avoid breaking it
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

    await this.jobService.addWebhookDelivery({
      endpointId: endpoint.id,
      payload,
      eventType: "webhook.test",
    });

    return { message: "Test webhook enqueued" };
  }

  async rotateSecret(workspaceId: string, endpointId: string) {
    const newRawSecret = `whsec_${randomUUID().replace(/-/g, "")}`;
    const encryptedSecret = this.encryption.encrypt(newRawSecret);

    const [updated] = await db
      .update(schema.webhookEndpoints)
      .set({ secret: encryptedSecret })
      .where(
        and(
          eq(schema.webhookEndpoints.id, endpointId),
          eq(schema.webhookEndpoints.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!updated) throw new NotFoundException("Webhook endpoint not found");
    return { secret: newRawSecret };
  }
}
