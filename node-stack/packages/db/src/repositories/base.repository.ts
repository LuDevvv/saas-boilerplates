import { Injectable, Inject } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { DB_TOKEN } from "../tokens";


@Injectable()
export abstract class BaseRepository<T = unknown> {
  protected abstract table: unknown; // e.g., schema.users
  protected abstract tableName: string; // e.g., 'users'
  protected tenantField: string = "workspaceId";

  constructor(
    @Inject(DB_TOKEN) protected readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findById(id: string): Promise<T | null> {
    const table = this.table as Record<string, unknown>;
    const name = this.tableName;
    const res = await (this.db.query as any)[name].findFirst({
      where: eq((table as any).id, id),
    });
    return res as T | null;
  }

  async findByIdWithTenant(tenantId: string, id: string): Promise<T | null> {
    const table = this.table as Record<string, unknown>;
    const tenantCol = (table as any)[this.tenantField];
    if (tenantCol) {
      return (this.db.query as any)[this.tableName].findFirst({
        where: and(eq(tenantCol, tenantId), eq((table as any).id, id)),
      }) as T | null;
    }
    return this.findById(id);
  }

  async findMany(where?: unknown): Promise<T[]> {
    const name = this.tableName;
    const res = await (this.db.query as any)[name].findMany({ where: where as any });
    return res as T[];
  }

  async findManyWithTenant(tenantId: string, where?: unknown): Promise<T[]> {
    const table = this.table as Record<string, unknown>;
    const tenantCol = (table as any)[this.tenantField];
    let finalWhere: unknown = where;
    if (tenantCol) {
      finalWhere = where
        ? and(eq(tenantCol, tenantId), where as any)
        : eq(tenantCol, tenantId);
    }
    return (this.db.query as any)[this.tableName].findMany({
      where: finalWhere as any,
    }) as T[];
  }

  async create(data: Record<string, unknown>, tx?: NodePgDatabase<typeof schema>): Promise<T> {
    const database = tx ?? this.db;
    const [record] = await (database.insert(this.table as any) as any)
      .values(data)
      .returning();
    return record as T;
  }

  async update(id: string, data: Record<string, unknown>, tx?: NodePgDatabase<typeof schema>): Promise<T | null> {
    const database = tx ?? this.db;
    const [record] = await (database.update(this.table as any) as any)
      .set(data)
      .where(eq((this.table as any).id, id))
      .returning();
    return (record as T) ?? null;
  }

  async delete(id: string, tx?: NodePgDatabase<typeof schema>): Promise<boolean> {
    const database = tx ?? this.db;
    const result = await (database.delete(this.table as any) as any)
      .where(eq((this.table as any).id, id))
      .returning();
    return (result?.length ?? 0) > 0;
  }
}
