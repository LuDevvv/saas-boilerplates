import { Injectable } from "@nestjs/common";
import { eq, and, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { BaseRepository } from "./base.repository";

type PortabilityRequest = typeof schema.portabilityRequests.$inferSelect;

@Injectable()
export class PortabilityRepository extends BaseRepository<PortabilityRequest> {
  protected table = schema.portabilityRequests;
  protected tableName = "portabilityRequests";

  async findActiveByWorkspace(workspaceId: string) {
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
    tx?: NodePgDatabase<typeof schema>
  ) {
    return this.update(id, { status, metadata }, tx);
  }

  async findExpired(now: Date = new Date()) {
    return this.db.query.portabilityRequests.findMany({
      where: and(
        eq(schema.portabilityRequests.status, "completed"),
        sql`(${schema.portabilityRequests.metadata}->>'expiresAt')::timestamp < ${now}`
      ),
    });
  }
}
