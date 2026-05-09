import { Injectable, Inject } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as apiKeys from '../schema/api-keys.js';
import * as schema from '../schema/index.js';
import { DB_TOKEN } from '../tokens.js';
import { BaseRepository } from './base.repository.js';

type ApiKey = typeof apiKeys.apiKeys.$inferSelect;
type Tx = NodePgDatabase<typeof schema>;

@Injectable()
export class ApiKeyRepository extends BaseRepository<ApiKey> {
  protected table = apiKeys.apiKeys;
  protected tableName = 'apiKeys';

  constructor(@Inject(DB_TOKEN) protected readonly db: Tx) {
    super(db);
  }

  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    const [key] = await this.db
      .select()
      .from(apiKeys.apiKeys)
      .where(eq(apiKeys.apiKeys.keyHash, keyHash))
      .limit(1);
    return key ?? null;
  }

  async findByPrefix(prefix: string): Promise<ApiKey | null> {
    const [key] = await this.db
      .select()
      .from(apiKeys.apiKeys)
      .where(eq(apiKeys.apiKeys.prefix, prefix))
      .limit(1);
    return key ?? null;
  }

  async findByWorkspace(workspaceId: string): Promise<ApiKey[]> {
    return this.db
      .select()
      .from(apiKeys.apiKeys)
      .where(eq(apiKeys.apiKeys.workspaceId, workspaceId));
  }

  async revoke(id: string, workspaceId: string, tx?: Tx): Promise<void> {
    const database = tx ?? this.db;
    await database
      .delete(apiKeys.apiKeys)
      .where(and(eq(apiKeys.apiKeys.id, id), eq(apiKeys.apiKeys.workspaceId, workspaceId)));
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.db
      .update(apiKeys.apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.apiKeys.id, id));
  }
}
