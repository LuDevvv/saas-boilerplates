import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import * as apiKeys from '../schema/api-keys';
import * as schema from '../schema';
import { DB_TOKEN } from '../tokens';
import { BaseRepository } from './base.repository';

@Injectable()
export class ApiKeyRepository extends BaseRepository<typeof apiKeys.apiKeys.$inferSelect> {
  protected table = apiKeys.apiKeys;
  protected tableName = 'apiKeys';

  constructor(@Inject(DB_TOKEN) protected readonly db: NodePgDatabase<typeof schema>) {
    super(db);
  }

  async findByKeyHash(keyHash: string) {
    const [key] = await this.db
      .select()
      .from(apiKeys.apiKeys)
      .where(eq(apiKeys.apiKeys.keyHash, keyHash))
      .limit(1);
    return key ?? null;
  }

  async findByPrefix(prefix: string) {
    const [key] = await this.db
      .select()
      .from(apiKeys.apiKeys)
      .where(eq(apiKeys.apiKeys.prefix, prefix))
      .limit(1);
    return key ?? null;
  }

  async findByWorkspace(workspaceId: string) {
    return this.db
      .select()
      .from(apiKeys.apiKeys)
      .where(eq(apiKeys.apiKeys.workspaceId, workspaceId));
  }

  async revoke(id: string, workspaceId: string, tx?: any) {
    const database = tx ?? this.db;
    await database
      .delete(apiKeys.apiKeys)
      .where(and(eq(apiKeys.apiKeys.id, id), eq(apiKeys.apiKeys.workspaceId, workspaceId)));
  }

  async updateLastUsed(id: string) {
    await this.db
      .update(apiKeys.apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.apiKeys.id, id));
  }
}
