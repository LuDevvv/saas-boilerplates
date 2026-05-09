import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Job, Worker } from "bullmq";
import { Redis } from "ioredis";

export interface EmailJobPayload {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, unknown>;
}

const renderTemplate = (_template: string, _data: Record<string, unknown>): string =>
  `Email template body simulated`;

@Injectable()
export class EmailProcessor implements OnModuleInit {
  private readonly logger = new Logger(EmailProcessor.name);
  private worker?: Worker<EmailJobPayload>;

  async onModuleInit(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    // Initialize BullMQ worker to process email jobs
    this.worker = new Worker<EmailJobPayload>(
      "email",
      async (job: Job<EmailJobPayload>): Promise<boolean> => {
        const payload = job.data;
        this.logger.log(
          `[Email Job] Processing job... to=${payload.to} subject=${payload.subject}`,
        );
        const body = renderTemplate(
          payload.template,
          payload.data ?? {},
        );
        // Simulate sending email
        this.logger.log(`[Email Job] Sent to ${payload.to}. Body: ${body}`);
        return true;
      },
      { connection, concurrency: 5 },
    );

    this.logger.log("[Email Processor] Started BullMQ email worker");
  }
}
