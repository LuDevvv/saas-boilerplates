import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CacheService } from "@node-stack/cache";
import {
  AuditLogRepository,
  AuthRepository,
  DB_TOKEN,
  SessionRepository,
  WorkspaceRepository,
  schema,
  withSystemTx,
} from "@node-stack/db";
import type { IStorageProvider } from "@node-stack/storage";
import { eq, lt, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { withRedisLock } from "@/common/maintenance/redis-lock.helper.js";

// Lease durations are slightly below the cron period so a crashed
// holder's lock expires before the next tick fires.
const HOURLY_LOCK_TTL_SECONDS = 55 * 60;
const DAILY_LOCK_TTL_SECONDS = 23 * 60 * 60;
const SOFT_DELETE_GRACE_DAYS = 30;

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
    private readonly sessionRepository: SessionRepository,
    private readonly authRepository: AuthRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly cache: CacheService,
  ) {}

  /**
   * Cron Job 1: Outbox Cleanup
   * Every hour, delete records from the outbox table that have processed: true
   * and are older than 48 hours.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOutbox(): Promise<void> {
    const result = await withRedisLock(
      this.cache,
      "cron:cleanup_outbox",
      HOURLY_LOCK_TTL_SECONDS,
      async () => {
        this.logger.log("Running Outbox cleanup...");
        const fortyEightHoursAgo = new Date();
        fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

        // outbox is RLS-protected; cross-tenant cleanup runs under the
        // system bypass policy added in migration 0016.
        return withSystemTx(async (tx) =>
          tx
            .delete(schema.outbox)
            .where(
              and(
                eq(schema.outbox.processed, true),
                lt(schema.outbox.createdAt, fortyEightHoursAgo)
              )
            )
            .returning({ id: schema.outbox.id }),
          this.db,
        );
      },
    );

    if (result === null) {
      this.logger.debug("cleanupOutbox skipped: lock held by peer instance");
      return;
    }
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
  async cleanupAbandonedUploads(): Promise<void> {
    const acquired = await withRedisLock(
      this.cache,
      "cron:cleanup_abandoned_uploads",
      DAILY_LOCK_TTL_SECONDS,
      async () => {
        this.logger.log("Running Abandoned Uploads cleanup...");
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // files is RLS-protected; cross-tenant scan runs under the system
        // bypass policy added in migration 0016.
        const abandonedFiles = await withSystemTx(async (tx) =>
          tx
            .select()
            .from(schema.files)
            .where(
              and(
                eq(schema.files.status, "pending"),
                lt(schema.files.createdAt, sevenDaysAgo)
              )
            ),
          this.db,
        );

        if (abandonedFiles.length === 0) {
          return 0;
        }

        this.logger.log(`Found ${abandonedFiles.length} abandoned uploads to clean.`);

        for (const file of abandonedFiles) {
          try {
            await this.storage.delete(file.key);
            await withSystemTx(
              async (tx) =>
                tx.delete(schema.files).where(eq(schema.files.id, file.id)),
              this.db,
            );
            this.logger.debug(`Deleted abandoned file ${file.id} (${file.key})`);
          } catch (err) {
            this.logger.error(`Failed to cleanup abandoned file ${file.id}:`, err);
          }
        }

        this.logger.log(`Abandoned uploads cleanup complete.`);
        return abandonedFiles.length;
      },
    );

    if (acquired === null) {
      this.logger.debug("cleanupAbandonedUploads skipped: lock held by peer instance");
    }
  }

  /**
   * Cron Job 3: Session Purge
   * Every midnight, delete expired records from the sessions table
   * to keep the index size small.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpiredSessions(): Promise<void> {
    const result = await withRedisLock(
      this.cache,
      "cron:purge_expired_sessions",
      DAILY_LOCK_TTL_SECONDS,
      async () => {
        this.logger.log("Running Expired Sessions purge...");
        const count = await this.sessionRepository.deleteExpired();
        if (count > 0) {
          this.logger.log(`Purged ${count} expired sessions.`);
        }
        return count;
      },
    );

    if (result === null) {
      this.logger.debug("purgeExpiredSessions skipped: lock held by peer instance");
    }
  }

  /**
   * Cron Job 4: Account anonymization (per ADR 0003).
   * Every day at 03:00, find users whose deleted_at is older than the
   * grace window and have not yet been anonymized; replace their PII
   * with deterministic placeholders. Users remain in the table for
   * referential integrity (audit_logs, etc.) but are no longer
   * identifiable.
   */
  @Cron("0 3 * * *")
  async anonymizeExpiredAccounts(): Promise<void> {
    const result = await withRedisLock(
      this.cache,
      "cron:anonymize_expired_accounts",
      DAILY_LOCK_TTL_SECONDS,
      async () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - SOFT_DELETE_GRACE_DAYS);
        this.logger.log(
          `Running account anonymization (cutoff=${cutoff.toISOString()})`,
        );

        return withSystemTx(async (tx) => {
          const users =
            await this.authRepository.findUsersExpiredForAnonymization(cutoff, tx);
          for (const user of users) {
            try {
              await this.authRepository.anonymizeUser(user.id, tx);
              await this.auditLog.create(
                {
                  workspaceId: null,
                  userId: user.id,
                  action: "auth.account_anonymized",
                  entityType: "user",
                  entityId: user.id,
                  metadata: {
                    deletedAt: user.deletedAt?.toISOString() ?? null,
                    deletionReason: user.deletionReason ?? null,
                  },
                },
                tx,
              );
            } catch (err) {
              this.logger.error(`Failed to anonymize user ${user.id}:`, err);
            }
          }
          if (users.length > 0) {
            this.logger.log(`Anonymized ${users.length} expired accounts.`);
          }
          return users.length;
        }, this.db);
      },
    );

    if (result === null) {
      this.logger.debug(
        "anonymizeExpiredAccounts skipped: lock held by peer instance",
      );
    }
  }

  /**
   * Cron Job 5: Workspace hard-delete (per ADR 0003).
   * Every day at 04:00, find workspaces whose deleted_at is older than
   * the grace window and permanently delete the row. Audit row is
   * written BEFORE the delete because workspace_id becomes invalid
   * immediately after.
   */
  @Cron("0 4 * * *")
  async hardDeleteExpiredWorkspaces(): Promise<void> {
    const result = await withRedisLock(
      this.cache,
      "cron:hard_delete_workspaces",
      DAILY_LOCK_TTL_SECONDS,
      async () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - SOFT_DELETE_GRACE_DAYS);
        this.logger.log(
          `Running workspace hard-delete (cutoff=${cutoff.toISOString()})`,
        );

        return withSystemTx(async (tx) => {
          const workspaces =
            await this.workspaceRepository.findWorkspacesExpiredForHardDelete(
              cutoff,
              tx,
            );
          for (const ws of workspaces) {
            try {
              await this.auditLog.create(
                {
                  workspaceId: ws.id,
                  userId: ws.deletedBy ?? null,
                  action: "workspace.workspace_hard_deleted",
                  entityType: "workspace",
                  entityId: ws.id,
                  metadata: {
                    slug: ws.slug,
                    name: ws.name,
                    deletedAt: ws.deletedAt?.toISOString() ?? null,
                    deletionReason: ws.deletionReason ?? null,
                  },
                },
                tx,
              );
              await this.workspaceRepository.hardDeleteWorkspace(ws.id, tx);
            } catch (err) {
              this.logger.error(`Failed to hard-delete workspace ${ws.id}:`, err);
            }
          }
          if (workspaces.length > 0) {
            this.logger.log(`Hard-deleted ${workspaces.length} workspaces.`);
          }
          return workspaces.length;
        }, this.db);
      },
    );

    if (result === null) {
      this.logger.debug(
        "hardDeleteExpiredWorkspaces skipped: lock held by peer instance",
      );
    }
  }
}
