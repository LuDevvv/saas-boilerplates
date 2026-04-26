import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DB_TOKEN } from "@node-stack/db";
import * as schema from "@node-stack/db";
import type { IStorageProvider } from "@node-stack/storage";
import { eq, lt, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
  ) {}

  /**
   * Cron Job 1: Outbox Cleanup
   * Every hour, delete records from the outbox table that have processed: true
   * and are older than 48 hours.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOutbox() {
    this.logger.log("Running Outbox cleanup...");
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const result = await this.db
      .delete(schema.outbox)
      .where(
        and(
          eq(schema.outbox.processed, true),
          lt(schema.outbox.createdAt, fortyEightHoursAgo)
        )
      )
      .returning({ id: schema.outbox.id });

    if (result.length > 0) {
      this.logger.log(`Cleaned up ${result.length} processed outbox events.`);
    }
  }

  /**
   * Cron Job 2: Abandoned Uploads
   * Every 24 hours, find files in the files table with status: 'pending'
   * older than 7 days, delete them from S3/Storage, and remove the DB record.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupAbandonedUploads() {
    this.logger.log("Running Abandoned Uploads cleanup...");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const abandonedFiles = await this.db
      .select()
      .from(schema.files)
      .where(
        and(
          eq(schema.files.status, "pending"),
          lt(schema.files.createdAt, sevenDaysAgo)
        )
      );

    if (abandonedFiles.length === 0) {
      return;
    }

    this.logger.log(`Found ${abandonedFiles.length} abandoned uploads to clean.`);

    for (const file of abandonedFiles) {
      try {
        // Delete from storage
        await this.storage.delete(file.key);
        
        // Delete from DB
        await this.db.delete(schema.files).where(eq(schema.files.id, file.id));
        
        this.logger.debug(`Deleted abandoned file ${file.id} (${file.key})`);
      } catch (err) {
        this.logger.error(`Failed to cleanup abandoned file ${file.id}:`, err);
      }
    }

    this.logger.log(`Abandoned uploads cleanup complete.`);
  }

  /**
   * Cron Job 3: Session Purge
   * Every midnight, delete expired records from the sessions table
   * to keep the index size small.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpiredSessions() {
    this.logger.log("Running Expired Sessions purge...");
    const now = new Date();

    const result = await this.db
      .delete(schema.sessions)
      .where(lt(schema.sessions.expiresAt, now))
      .returning({ id: schema.sessions.id });

    if (result.length > 0) {
      this.logger.log(`Purged ${result.length} expired sessions.`);
    }
  }
}
