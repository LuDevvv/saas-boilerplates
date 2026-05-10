import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { Redis } from "ioredis";

import type { EmailJobPayload } from "./queues.js";

export class EmailProducer {
  private static queue: Queue | null = null;

  private static getQueue(): Queue {
    if (!EmailProducer.queue) {
      const redisUrl = process.env["REDIS_URL"] ?? "redis://localhost:6379";
      const redisPrefix = process.env["REDIS_PREFIX"] ?? "bull";
      const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
      const q = new Queue("email", {
        connection: connection as unknown as ConnectionOptions,
        prefix: redisPrefix,
      });
      EmailProducer.queue = q;
    }
    return EmailProducer.queue;
  }

  static async addSendEmail(payload: EmailJobPayload): Promise<void> {
    const q = EmailProducer.getQueue();
    await q.add("sendEmail", payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });
  }
}
