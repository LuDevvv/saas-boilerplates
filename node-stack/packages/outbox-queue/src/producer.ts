import { Queue } from "bullmq";

const QUEUE_NAME = "outbox";

export class OutboxProducer {
  private static queue: Queue | null = null;

  static init(): void {
    this.queue = new Queue(QUEUE_NAME, {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });
  }

  static async addProcessOutboxJob(outboxId: string): Promise<void> {
    if (!this.queue) this.init();
    await (this.queue as Queue).add("process-outbox", { outboxId });
  }
}

export default OutboxProducer;
