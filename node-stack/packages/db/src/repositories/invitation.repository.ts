import { Injectable, Inject } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";

type Invitation = typeof schema.workspaceInvitations.$inferSelect;
type CreateInvitationData = typeof schema.workspaceInvitations.$inferInsert;
export type UpdateInvitationData = Partial<CreateInvitationData>;

@Injectable()
export class InvitationRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findById(id: string, tx?: NodePgDatabase<typeof schema>) {
    const database = tx ?? this.db;
    return database.query.workspaceInvitations.findFirst({
      where: eq(schema.workspaceInvitations.id, id),
    });
  }

  async findByToken(token: string, tx?: NodePgDatabase<typeof schema>) {
    const database = tx ?? this.db;
    return database.query.workspaceInvitations.findFirst({
      where: eq(schema.workspaceInvitations.token, token),
    });
  }

  async findPendingByEmailAndWorkspace(
    email: string,
    workspaceId: string,
    tx?: NodePgDatabase<typeof schema>,
  ) {
    const database = tx ?? this.db;
    return database.query.workspaceInvitations.findFirst({
      where: and(
        eq(schema.workspaceInvitations.email, email),
        eq(schema.workspaceInvitations.workspaceId, workspaceId),
        eq(schema.workspaceInvitations.status, "pending"),
      ),
    });
  }

  async findManyByWorkspace(
    workspaceId: string,
    tx?: NodePgDatabase<typeof schema>,
  ) {
    const database = tx ?? this.db;
    return database.query.workspaceInvitations.findMany({
      where: eq(schema.workspaceInvitations.workspaceId, workspaceId),
    });
  }

  async findManyPendingByEmail(
    email: string,
    tx?: NodePgDatabase<typeof schema>,
  ) {
    const database = tx ?? this.db;
    return database.query.workspaceInvitations.findMany({
      where: and(
        eq(schema.workspaceInvitations.email, email),
        eq(schema.workspaceInvitations.status, "pending"),
      ),
    });
  }

  async create(data: CreateInvitationData, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    const [invitation] = await db
      .insert(schema.workspaceInvitations)
      .values(data)
      .returning();
    return invitation;
  }

  async update(id: string, data: UpdateInvitationData, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    await db
      .update(schema.workspaceInvitations)
      .set(data)
      .where(eq(schema.workspaceInvitations.id, id));
  }

  async delete(id: string, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    await db
      .delete(schema.workspaceInvitations)
      .where(eq(schema.workspaceInvitations.id, id));
  }
}
