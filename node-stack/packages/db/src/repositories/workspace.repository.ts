import { Injectable, Inject } from "@nestjs/common";
import { eq, and, gt, isNull, lt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema/index.js";
import { DB_TOKEN } from "../tokens.js";

type Workspace = typeof schema.workspaces.$inferSelect;
type CreateWorkspaceData = typeof schema.workspaces.$inferInsert;
export type UpdateWorkspaceData = Partial<CreateWorkspaceData>;

type Membership = typeof schema.memberships.$inferSelect;
type CreateMembershipData = typeof schema.memberships.$inferInsert;
export type UpdateMembershipData = Partial<CreateMembershipData>;

type Tx = NodePgDatabase<typeof schema>;

type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: Date;
  role: string;
};

type MemberSummary = {
  userId: string;
  role: string;
  createdAt: Date;
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

@Injectable()
export class WorkspaceRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Tx,
  ) {}

  async findAllByUserId(
    userId: string,
    cursor?: string,
    limit: number = 20,
    tx?: Tx,
  ): Promise<{ workspaces: WorkspaceSummary[]; nextCursor: string | null }> {
    const database = tx ?? this.db;
    const conditions = [eq(schema.memberships.userId, userId)];

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8")) as { id?: string };
        if (decoded?.id) {
          conditions.push(gt(schema.workspaces.id, decoded.id));
        }
      } catch {
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

  async findById(
    id: string,
    tx?: Tx,
    opts: { includeDeleted?: boolean } = {},
  ): Promise<Workspace | undefined> {
    const database = tx ?? this.db;
    return database.query.workspaces.findFirst({
      where: opts.includeDeleted
        ? eq(schema.workspaces.id, id)
        : and(eq(schema.workspaces.id, id), isNull(schema.workspaces.deletedAt)),
    });
  }

  async findBySlug(
    slug: string,
    tx?: Tx,
    opts: { includeDeleted?: boolean } = {},
  ): Promise<Workspace | undefined> {
    const database = tx ?? this.db;
    return database.query.workspaces.findFirst({
      where: opts.includeDeleted
        ? eq(schema.workspaces.slug, slug)
        : and(eq(schema.workspaces.slug, slug), isNull(schema.workspaces.deletedAt)),
    });
  }

  async create(data: CreateWorkspaceData, tx?: Tx): Promise<Workspace> {
    const db = tx ?? this.db;
    const [workspace] = await db
      .insert(schema.workspaces)
      .values(data)
      .returning();
    return workspace;
  }

  async update(id: string, data: UpdateWorkspaceData, tx?: Tx): Promise<Workspace | undefined> {
    const db = tx ?? this.db;
    const [workspace] = await db
      .update(schema.workspaces)
      .set(data)
      .where(eq(schema.workspaces.id, id))
      .returning();
    return workspace;
  }

  async delete(id: string, tx?: Tx): Promise<void> {
    const db = tx ?? this.db;
    await db
      .delete(schema.workspaces)
      .where(eq(schema.workspaces.id, id));
  }

  async findMembersByWorkspaceId(
    workspaceId: string,
    tx?: Tx,
  ): Promise<MemberSummary[]> {
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

  async findMembership(workspaceId: string, userId: string, tx?: Tx): Promise<Membership | undefined> {
    const db = tx ?? this.db;
    return db.query.memberships.findFirst({
      where: and(
        eq(schema.memberships.workspaceId, workspaceId),
        eq(schema.memberships.userId, userId),
      ),
    });
  }

  async createMembership(data: CreateMembershipData, tx?: Tx): Promise<void> {
    const db = tx ?? this.db;
    await db.insert(schema.memberships).values(data);
  }

  async updateMembership(workspaceId: string, userId: string, data: UpdateMembershipData, tx?: Tx): Promise<void> {
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

  async deleteMembership(workspaceId: string, userId: string, tx?: Tx): Promise<void> {
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

  // ── Soft-delete (per ADR 0003) ──────────────────────────

  /**
   * Soft-delete the workspace and cascade:
   *   - mark all memberships as 'removed' (preserves audit trail)
   * api_keys revocation and invitation soft-delete are caller-driven
   * to keep this method narrow.
   *
   * After 30 days the cron will call `hardDeleteWorkspace`.
   */
  async softDeleteWorkspace(
    workspaceId: string,
    deletedBy: string | null,
    reason: string | null,
    tx?: Tx,
  ): Promise<void> {
    const db = tx ?? this.db;
    await db
      .update(schema.workspaces)
      .set({
        deletedAt: new Date(),
        deletedBy: deletedBy ?? undefined,
        deletionReason: reason ?? undefined,
      })
      .where(eq(schema.workspaces.id, workspaceId));
    await db
      .update(schema.memberships)
      .set({ status: "removed" })
      .where(eq(schema.memberships.workspaceId, workspaceId));
  }

  async hardDeleteWorkspace(workspaceId: string, tx?: Tx): Promise<void> {
    const db = tx ?? this.db;
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, workspaceId));
  }

  async findWorkspacesExpiredForHardDelete(
    cutoff: Date,
    tx?: Tx,
  ): Promise<Workspace[]> {
    const db = tx ?? this.db;
    return db.query.workspaces.findMany({
      where: lt(schema.workspaces.deletedAt, cutoff),
    });
  }
}
