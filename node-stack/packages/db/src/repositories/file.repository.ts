import { Injectable, Inject } from "@nestjs/common";
import { files, File, NewFile } from "../schema/storage.js";
import { DB_TOKEN } from "../tokens.js";
import type { Database } from "../index.js";
import { eq, and } from "drizzle-orm";

@Injectable()
export class FileRepository {
  constructor(@Inject(DB_TOKEN) private readonly db: Database) {}

  async create(data: NewFile, tx?: Database): Promise<File> {
    const database = tx ?? this.db;
    const [result] = await database.insert(files).values(data).returning();
    return result;
  }

  async findById(id: string, tx?: Database): Promise<File | undefined> {
    const database = tx ?? this.db;
    const [result] = await database
      .select()
      .from(files)
      .where(eq(files.id, id))
      .limit(1);
    return result;
  }

  async findByKey(key: string, tx?: Database): Promise<File | undefined> {
    const database = tx ?? this.db;
    const [result] = await database
      .select()
      .from(files)
      .where(eq(files.key, key))
      .limit(1);
    return result;
  }

  async updateStatus(
    id: string,
    status: File["status"],
    tx?: Database,
  ): Promise<File> {
    const database = tx ?? this.db;
    const [result] = await database
      .update(files)
      .set({ status, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return result;
  }

  async listByWorkspace(workspaceId: string, tx?: Database): Promise<File[]> {
    const database = tx ?? this.db;
    return await database
      .select()
      .from(files)
      .where(eq(files.workspaceId, workspaceId))
      .orderBy(files.createdAt);
  }

  async delete(id: string, tx?: Database): Promise<void> {
    const database = tx ?? this.db;
    await database.delete(files).where(eq(files.id, id));
  }
}
