import { Injectable, Inject } from "@nestjs/common";
import { eq, and, desc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { DB_TOKEN } from "../tokens";

type Db = NodePgDatabase<typeof schema>;

@Injectable()
export class InboundWebhookRepository {
  constructor(@Inject(DB_TOKEN) private readonly db: Db) {}

  // ─── Idempotency ─────────────────────────────────────────────────────

  /**
   * Check if a webhook event from a given provider has already been processed.
   * Returns the existing log if found, null otherwise.
   */
  async findByProviderEventId(
    provider: schema.InboundWebhookLog["provider"],
    providerEventId: string,
    tx?: Db,
  ): Promise<schema.InboundWebhookLog | null> {
    const database = tx ?? this.db;
    const result = await database.query.inboundWebhookLogs.findFirst({
      where: and(
        eq(schema.inboundWebhookLogs.provider, provider),
        eq(schema.inboundWebhookLogs.providerEventId, providerEventId),
      ),
    });
    return result ?? null;
  }

  /**
   * Returns true if this event has already been successfully processed.
   */
  async isAlreadyProcessed(
    provider: schema.InboundWebhookLog["provider"],
    providerEventId: string,
    tx?: Db,
  ): Promise<boolean> {
    const existing = await this.findByProviderEventId(
      provider,
      providerEventId,
      tx,
    );
    return existing?.status === "processed";
  }

  // ─── CRUD ────────────────────────────────────────────────────────────

  /**
   * Create a new inbound webhook log entry.
   * Called as soon as the request arrives (before validation).
   */
  async create(
    data: schema.NewInboundWebhookLog,
    tx?: Db,
  ): Promise<schema.InboundWebhookLog> {
    const database = tx ?? this.db;
    const [record] = await database
      .insert(schema.inboundWebhookLogs)
      .values(data)
      .returning();
    return record!;
  }

  /**
   * Update the status and metadata of an inbound webhook log.
   */
  async updateStatus(
    id: string,
    updates: {
      status: schema.InboundWebhookLog["status"];
      signatureValid?: boolean;
      errorMessage?: string | null;
      internalEventName?: string | null;
      parsedPayload?: unknown;
      responseStatus?: number;
      processingDurationMs?: number;
      processedAt?: Date;
      processingAttempts?: number;
    },
    tx?: Db,
  ): Promise<schema.InboundWebhookLog | null> {
    const database = tx ?? this.db;
    const [updated] = await database
      .update(schema.inboundWebhookLogs)
      .set({
        ...updates,
        processedAt: updates.processedAt ?? (updates.status === "processed" ? new Date() : undefined),
      })
      .where(eq(schema.inboundWebhookLogs.id, id))
      .returning();
    return updated ?? null;
  }

  // ─── Query Operations ────────────────────────────────────────────────

  /**
   * List recent webhook logs for a provider (used for debugging).
   */
  async findRecent(
    provider?: schema.InboundWebhookLog["provider"],
    limit: number = 50,
    tx?: Db,
  ): Promise<schema.InboundWebhookLog[]> {
    const database = tx ?? this.db;

    if (provider) {
      return database.query.inboundWebhookLogs.findMany({
        where: eq(schema.inboundWebhookLogs.provider, provider),
        orderBy: desc(schema.inboundWebhookLogs.createdAt),
        limit,
      });
    }

    return database.query.inboundWebhookLogs.findMany({
      orderBy: desc(schema.inboundWebhookLogs.createdAt),
      limit,
    });
  }

  /**
   * Find failed/rejected webhooks for potential replay.
   */
  async findFailed(
    provider?: schema.InboundWebhookLog["provider"],
    limit: number = 50,
    tx?: Db,
  ): Promise<schema.InboundWebhookLog[]> {
    const database = tx ?? this.db;

    const conditions = [
      sql`${schema.inboundWebhookLogs.status} IN ('rejected', 'failed')`,
    ];

    if (provider) {
      conditions.push(eq(schema.inboundWebhookLogs.provider, provider));
    }

    return database.query.inboundWebhookLogs.findMany({
      where: and(...conditions),
      orderBy: desc(schema.inboundWebhookLogs.createdAt),
      limit,
    });
  }

  /**
   * Get a single webhook log by ID (for replay/inspection).
   */
  async findById(id: string, tx?: Db): Promise<schema.InboundWebhookLog | null> {
    const database = tx ?? this.db;
    const result = await database.query.inboundWebhookLogs.findFirst({
      where: eq(schema.inboundWebhookLogs.id, id),
    });
    return result ?? null;
  }

  // ─── Transactions ─────────────────────────────────────────────────────

  async transaction<T>(callback: (tx: Db) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      return callback(tx as unknown as Db);
    });
  }
}
