import { Injectable, Inject } from '@nestjs/common';
import { schema, DB_TOKEN, type Database } from '@node-stack/db';

@Injectable()
export class OutboxService {
  constructor(@Inject(DB_TOKEN) private readonly db: Database) {}

  async createEvent(
    eventType: string,
    payload: Record<string, unknown>,
    tx?: Database,
    workspaceId?: string,
  ) {
    const database = tx ?? this.db;
    await database.insert(schema.outbox).values({
      eventType,
      payload,
      workspaceId,
    });
  }

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
