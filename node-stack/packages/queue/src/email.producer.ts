import { Queue } from "bullmq";
import Redis from "ioredis";

import type { EmailJobPayload } from "./queues";

// Simple producer for sending email jobs
export class EmailProducer {
  private static queue: any;

  private static getQueue(): any {
    if (!EmailProducer.queue) {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      const redisPrefix = process.env.REDIS_PREFIX || "bull";
      const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
      EmailProducer.queue = new Queue("email", {
        connection: connection as any,
        prefix: redisPrefix,
      });
    }
    return EmailProducer.queue;
  }

  static async addSendEmail(payload: EmailJobPayload) {
    const q = EmailProducer.getQueue();
    // Attach a rendered body via template at consumer time; store template & data for rendering
    await q.add("sendEmail", payload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
  }
}
