import { Injectable } from "@nestjs/common";
import { eq, and, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { BaseRepository } from "./base.repository.js";
import * as schema from "../schema/index.js";

type PortabilityRequest = typeof schema.portabilityRequests.$inferSelect;
type Tx = NodePgDatabase<typeof schema>;

@Injectable()
export class PortabilityRepository extends BaseRepository<PortabilityRequest> {
  protected table = schema.portabilityRequests;
  protected tableName = "portabilityRequests";

  async findActiveByWorkspace(workspaceId: string): Promise<PortabilityRequest | undefined> {
    return this.db.query.portabilityRequests.findFirst({
      where: and(
        eq(schema.portabilityRequests.workspaceId, workspaceId),
        sql`${schema.portabilityRequests.status} IN ('pending', 'processing')`
      ),
    });
  }

  async updateStatus(
    id: string,
    status: PortabilityRequest["status"],
    metadata?: PortabilityRequest["metadata"],
    tx?: Tx
  ): Promise<PortabilityRequest | null> {
    return this.update(id, { status, metadata }, tx);
  }

  async findExpired(now: Date = new Date()): Promise<PortabilityRequest[]> {
    return this.db.query.portabilityRequests.findMany({
      where: and(
        eq(schema.portabilityRequests.status, "completed"),
        sql`(${schema.portabilityRequests.metadata}->>'expiresAt')::timestamp < ${now}`
      ),
    });
  }
}
