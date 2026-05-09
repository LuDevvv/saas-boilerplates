import { Injectable, Inject } from '@nestjs/common';
import { schema, DB_TOKEN } from '@node-stack/db';
import type { Database } from '@node-stack/db';

@Injectable()
export class OutboxService {
  constructor(@Inject(DB_TOKEN) private readonly db: Database) {}

  async createEvent(
    eventType: string,
    payload: Record<string, unknown> | unknown,
    tx?: Database,
    workspaceId?: string,
  ): Promise<void> {
    const database = tx ?? this.db;
    await database.insert(schema.outbox).values({
      eventType,
      payload,
      workspaceId,
    });
  }

  async transaction<T>(callback: (tx: Database) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
