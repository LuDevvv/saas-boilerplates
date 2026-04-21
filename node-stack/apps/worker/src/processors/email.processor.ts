import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";

export type EmailJobPayload = any;
const renderTemplate = (a: any, b: any) => `Email template body simulated`;

@Injectable()
export class EmailProcessor implements OnModuleInit {
  private readonly logger = new Logger(EmailProcessor.name);
  private worker?: Worker<EmailJobPayload>;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null }) as any;
    // Initialize BullMQ worker to process email jobs
    this.worker = new Worker<EmailJobPayload>(
      "email",
      async (job: Job<EmailJobPayload>) => {
        const payload: EmailJobPayload = job.data;
        this.logger.log(
          `[Email Job] Processing job... to=${payload.to} subject=${payload.subject}`,
        );
        const body = renderTemplate(
          payload.template,
          (payload.data as any) || {},
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
