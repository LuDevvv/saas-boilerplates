import { Injectable } from "@nestjs/common";
import { db, schema } from "@node-stack/db";
import type { NewOutboxEvent } from "@node-stack/db";

@Injectable()
export class OutboxWriter {
  async write(event: NewOutboxEvent): Promise<void> {
    await db.insert(schema.outbox).values(event);
  }
}
