import { Injectable, Inject } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema/index.js";
import { DB_TOKEN } from "../tokens.js";

type Db = NodePgDatabase<typeof schema>;
type SchemaQuery = Db["query"];

@Injectable()
export abstract class BaseRepository<T = unknown> {
  protected abstract table: unknown; // e.g., schema.users
  protected abstract tableName: string; // e.g., 'users'
  protected tenantField: string = "workspaceId";

  constructor(
    @Inject(DB_TOKEN) protected readonly db: Db,
  ) {}

  async findById(id: string): Promise<T | null> {
    const table = this.table as Record<string, unknown>;
    const name = this.tableName as keyof SchemaQuery;
    const queryTable = this.db.query[name] as unknown as {
      findFirst: (opts: { where: unknown }) => Promise<T | undefined>;
    };
    const res = await queryTable.findFirst({
      where: eq(table["id"] as Parameters<typeof eq>[0], id),
    });
    return res ?? null;
  }

  async findByIdWithTenant(tenantId: string, id: string): Promise<T | null> {
    const table = this.table as Record<string, unknown>;
    const tenantColKey = this.tenantField as keyof typeof table;
    const tenantCol = table[tenantColKey];
    const name = this.tableName as keyof SchemaQuery;
    const queryTable = this.db.query[name] as unknown as {
      findFirst: (opts: { where: unknown }) => Promise<T | undefined>;
    };
    if (tenantCol) {
      const res = await queryTable.findFirst({
        where: and(
          eq(tenantCol as Parameters<typeof eq>[0], tenantId),
          eq(table["id"] as Parameters<typeof eq>[0], id),
        ),
      });
      return res ?? null;
    }
    return this.findById(id);
  }

  async findMany(where?: unknown): Promise<T[]> {
    const name = this.tableName as keyof SchemaQuery;
    const queryTable = this.db.query[name] as unknown as {
      findMany: (opts: { where: unknown }) => Promise<T[]>;
    };
    const res = await queryTable.findMany({ where });
    return res;
  }

  async findManyWithTenant(tenantId: string, where?: unknown): Promise<T[]> {
    const table = this.table as Record<string, unknown>;
    const tenantColKey = this.tenantField as keyof typeof table;
    const tenantCol = table[tenantColKey];
    const finalWhere: unknown = tenantCol
      ? where
        ? and(eq(tenantCol as Parameters<typeof eq>[0], tenantId), where as Parameters<typeof eq>[0])
        : eq(tenantCol as Parameters<typeof eq>[0], tenantId)
      : where;
    const name = this.tableName as keyof SchemaQuery;
    const queryTable = this.db.query[name] as unknown as {
      findMany: (opts: { where: unknown }) => Promise<T[]>;
    };
    return queryTable.findMany({ where: finalWhere });
  }

  async create(data: Record<string, unknown>, tx?: Db): Promise<T> {
    const database = tx ?? this.db;
    const tableRef = this.table as Parameters<typeof database.insert>[0];
    const [record] = await database.insert(tableRef).values(data).returning();
    return record as T;
  }

  async update(id: string, data: Record<string, unknown>, tx?: Db): Promise<T | null> {
    const database = tx ?? this.db;
    const tableRef = this.table as Parameters<typeof database.update>[0];
    const tableWithId = this.table as Record<string, Parameters<typeof eq>[0]>;
    const [record] = await database.update(tableRef)
      .set(data)
      .where(eq(tableWithId["id"], id))
      .returning();
    return (record as T) ?? null;
  }

  async delete(id: string, tx?: Db): Promise<boolean> {
    const database = tx ?? this.db;
    const tableRef = this.table as Parameters<typeof database.delete>[0];
    const tableWithId = this.table as Record<string, Parameters<typeof eq>[0]>;
    const result = await database.delete(tableRef)
      .where(eq(tableWithId["id"], id))
      .returning();
    return (result?.length ?? 0) > 0;
  }
}
