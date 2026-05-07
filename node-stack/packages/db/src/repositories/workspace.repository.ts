import { Injectable, Inject } from "@nestjs/common";
import { eq, and, gt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";

type Workspace = typeof schema.workspaces.$inferSelect;
type CreateWorkspaceData = typeof schema.workspaces.$inferInsert;
export type UpdateWorkspaceData = Partial<CreateWorkspaceData>;

type Membership = typeof schema.memberships.$inferSelect;
type CreateMembershipData = typeof schema.memberships.$inferInsert;
export type UpdateMembershipData = Partial<CreateMembershipData>;

@Injectable()
export class WorkspaceRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAllByUserId(
    userId: string,
    cursor?: string,
    limit: number = 20,
    tx?: NodePgDatabase<typeof schema>,
  ) {
    const database = tx ?? this.db;
    const conditions = [eq(schema.memberships.userId, userId)];

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
        if (decoded?.id) {
          conditions.push(gt(schema.workspaces.id, decoded.id));
        }
      } catch (e) {
        // Ignore invalid cursor
      }
    }

    const workspaces = await database
      .select({
        id: schema.workspaces.id,
        name: schema.workspaces.name,
        slug: schema.workspaces.slug,
        logoUrl: schema.workspaces.logoUrl,
        createdAt: schema.workspaces.createdAt,
        role: schema.memberships.role,
      })
      .from(schema.memberships)
      .innerJoin(
        schema.workspaces,
        eq(schema.memberships.workspaceId, schema.workspaces.id),
      )
      .where(and(...conditions))
      .orderBy(schema.workspaces.id)
      .limit(limit);

    const nextCursor = workspaces.length === limit
      ? Buffer.from(JSON.stringify({ id: workspaces[workspaces.length - 1].id })).toString("base64")
      : null;

    return { workspaces, nextCursor };
  }

  async findById(id: string, tx?: NodePgDatabase<typeof schema>) {
    const database = tx ?? this.db;
    return database.query.workspaces.findFirst({
      where: eq(schema.workspaces.id, id),
    });
  }

  async findBySlug(slug: string, tx?: NodePgDatabase<typeof schema>) {
    const database = tx ?? this.db;
    return database.query.workspaces.findFirst({
      where: eq(schema.workspaces.slug, slug),
    });
  }

  async create(data: CreateWorkspaceData, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    const [workspace] = await db
      .insert(schema.workspaces)
      .values(data)
      .returning();
    return workspace;
  }

  async update(id: string, data: UpdateWorkspaceData, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    const [workspace] = await db
      .update(schema.workspaces)
      .set(data)
      .where(eq(schema.workspaces.id, id))
      .returning();
    return workspace;
  }

  async delete(id: string, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    await db
      .delete(schema.workspaces)
      .where(eq(schema.workspaces.id, id));
  }

  async findMembersByWorkspaceId(
    workspaceId: string,
    tx?: NodePgDatabase<typeof schema>,
  ) {
    const database = tx ?? this.db;
    return database
      .select({
        userId: schema.memberships.userId,
        role: schema.memberships.role,
        createdAt: schema.memberships.createdAt,
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.memberships)
      .innerJoin(schema.users, eq(schema.memberships.userId, schema.users.id))
      .where(eq(schema.memberships.workspaceId, workspaceId));
  }

  async findMembership(workspaceId: string, userId: string, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    return db.query.memberships.findFirst({
      where: and(
        eq(schema.memberships.workspaceId, workspaceId),
        eq(schema.memberships.userId, userId),
      ),
    });
  }

  async createMembership(data: CreateMembershipData, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    await db.insert(schema.memberships).values(data);
  }

  async updateMembership(workspaceId: string, userId: string, data: UpdateMembershipData, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    await db
      .update(schema.memberships)
      .set(data)
      .where(
        and(
          eq(schema.memberships.workspaceId, workspaceId),
          eq(schema.memberships.userId, userId),
        ),
      );
  }

  async deleteMembership(workspaceId: string, userId: string, tx?: NodePgDatabase<typeof schema>) {
    const db = tx ?? this.db;
    await db
      .delete(schema.memberships)
      .where(
        and(
          eq(schema.memberships.workspaceId, workspaceId),
          eq(schema.memberships.userId, userId),
        ),
      );
  }

  async transaction<T>(callback: (tx: NodePgDatabase<typeof schema>) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
