import { Injectable, Inject } from "@nestjs/common";
import { schema, DB_TOKEN } from "@node-stack/db";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()
export class OutboxService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createEvent(
    eventType: string,
    payload: Record<string, unknown>,
    tx?: NodePgDatabase<typeof schema>,
    workspaceId?: string,
  ) {
    const database = tx ?? this.db;
    await database.insert(schema.outbox).values({
      eventType,
      payload,
      workspaceId,
    });
  }

  async transaction<T>(callback: (tx: NodePgDatabase<typeof schema>) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
