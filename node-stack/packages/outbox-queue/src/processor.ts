import { Processor, WorkerHost } from "@nestjs/bullmq";
import { db, schema, eq } from "@node-stack/db";
import { Job } from "bullmq";

const MAX_RETRIES = 5;

@Processor("outbox")
export class OutboxProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    const outboxId = job.data?.outboxId as string;

    const event = await db.query.outbox.findFirst({
      where: eq(schema.outbox.id, outboxId),
    });

    if (!event) {
      return;
    }

    try {
      // Placeholder: add real event handlers here based on event.eventType
      switch (event.eventType) {
        case "user.registered":
          // Implement user welcome logic, if needed
          break;
        case "workspace.created":
          // Implement workspace-related side effects
          break;
        default:
          // Unknown event; just mark as processed to avoid stuck
          break;
      }

      await db
        .update(schema.outbox)
        .set({ processed: true, processedAt: new Date() as any })
        .where(eq(schema.outbox.id, outboxId));
    } catch (error: any) {
      const retryCount = (event.retryCount ?? 0) + 1;
      await db
        .update(schema.outbox)
        .set({ retryCount, lastError: error?.message })
        .where(eq(schema.outbox.id, outboxId));

      if (retryCount >= MAX_RETRIES) {
        await db
          .update(schema.outbox)
          .set({ processed: true })
          .where(eq(schema.outbox.id, outboxId));
      }

      throw error; // BullMQ will retry according to its config
    }
  }
}
