import { Processor, InjectQueue } from "@nestjs/bullmq";
import { Logger, Inject } from "@nestjs/common";
import { schema, eq, RequestContextService, DB_TOKEN, type Database } from "@node-stack/db";
import { Job, Queue } from "bullmq";
import { BaseWorker } from "../base.worker.js";
import { PortabilityExporter } from "@node-stack/services";
import type { IStorageProvider } from "@node-stack/storage";

interface PortabilityJobPayload {
  requestId: string;
  workspaceId: string;
  userId: string;
}

@Processor("portability")
export class PortabilityProcessor extends BaseWorker {
  protected readonly logger = new Logger(PortabilityProcessor.name);
  protected readonly queueName = "portability";

  constructor(
    @InjectQueue("dlq") private readonly dlqQueue: Queue,
    @Inject(PortabilityExporter) private readonly exporter: PortabilityExporter,
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
    @Inject(DB_TOKEN) private readonly db: Database,
    protected readonly contextService: RequestContextService,
  ) {
    super(contextService);
  }

  protected getDlqQueue(): Queue {
    return this.dlqQueue;
  }

  async processJob(job: Job<PortabilityJobPayload>): Promise<void> {
    const { requestId, workspaceId } = job.data;

    this.logger.log(`Starting portability processing for request: ${requestId}`);

    await this.db
      .update(schema.portabilityRequests)
      .set({
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(schema.portabilityRequests.id, requestId));

    try {
      // 1. Generate recursively gathered and sanitized data buffer (ZIP)
      const buffer = await this.exporter.exportWorkspaceData(workspaceId);

      // 2. Upload to storage
      const fileKey = `exports/${workspaceId}/portability_${requestId}.zip`;
      await this.storage.upload({
        key: fileKey,
        body: buffer,
        contentType: 'application/zip',
        public: false, // Must be private for secure delivery
      });

      // 3. Mark as completed
      await this.db
        .update(schema.portabilityRequests)
        .set({
          status: 'completed',
          metadata: {
            fileKey,
            sizeBytes: buffer.length,
          },
          updatedAt: new Date(),
        })
        .where(eq(schema.portabilityRequests.id, requestId));

      this.logger.log(`Portability processing completed for request: ${requestId}`);
    } catch (error) {
      this.logger.error(`Failed to process portability request ${requestId}: ${error}`);
      
      await this.db
        .update(schema.portabilityRequests)
        .set({
          status: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(schema.portabilityRequests.id, requestId));

      throw error;
    }
  }
}
