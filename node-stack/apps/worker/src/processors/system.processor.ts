import { Processor } from "@nestjs/bullmq";
import { Logger, Inject } from "@nestjs/common";
import { db, schema, eq, and, lt, sql } from "@node-stack/db";
import { Job } from "bullmq";
import { BaseWorker } from "../base.worker";
import { IStorageProvider } from "@node-stack/storage";

@Processor("system")
export class SystemProcessor extends BaseWorker {
  protected readonly logger = new Logger(SystemProcessor.name);
  protected readonly queueName = "system";

  constructor(
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
  ) {
    super();
  }

  async processJob(job: Job): Promise<void> {
    if (job.name === "cleanup-portability") {
      await this.cleanupPortabilityExports();
    }
  }

  private async cleanupPortabilityExports() {
    this.logger.log("Running portability cleanup task...");

    // Find exports older than 7 days that are completed
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const expiredRequests = await db.query.portabilityRequests.findMany({
      where: and(
        eq(schema.portabilityRequests.status, 'completed'),
        lt(schema.portabilityRequests.createdAt, sevenDaysAgo)
      ),
    });

    for (const request of expiredRequests) {
      if (request.metadata?.fileKey) {
        try {
          this.logger.log(`Deleting expired export file: ${request.metadata.fileKey}`);
          await this.storage.delete(request.metadata.fileKey as string);
        } catch (error) {
          this.logger.error(`Failed to delete file ${request.metadata.fileKey}: ${error}`);
        }
      }

      await db
        .update(schema.portabilityRequests)
        .set({
          status: 'expired',
          metadata: {
            ...request.metadata,
            deletedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(schema.portabilityRequests.id, request.id));
    }

    this.logger.log(`Cleanup complete. Processed ${expiredRequests.length} requests.`);
  }
}
