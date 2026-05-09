import { Injectable, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema/index.js";
import { DB_TOKEN } from "../tokens.js";

type SystemConfig = typeof schema.systemConfig.$inferSelect;
type Tx = NodePgDatabase<typeof schema>;

@Injectable()
export class SystemConfigRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Tx,
  ) {}

  async get(key: string, tx?: Tx): Promise<SystemConfig | undefined> {
    const database = tx ?? this.db;
    return database.query.systemConfig.findFirst({
      where: eq(schema.systemConfig.key, key),
    });
  }

  async all(tx?: Tx): Promise<SystemConfig[]> {
    const database = tx ?? this.db;
    return database.query.systemConfig.findMany();
  }

  async set(key: string, value: unknown, updatedBy?: string, tx?: Tx): Promise<void> {
    const database = tx ?? this.db;
    await database
      .insert(schema.systemConfig)
      .values({
        key,
        value: value as SystemConfig["value"],
        updatedBy,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.systemConfig.key,
        set: {
          value: value as SystemConfig["value"],
          updatedBy,
          updatedAt: new Date(),
        },
      });
  }
}
