import { Injectable, Inject } from "@nestjs/common";
import { files, File, NewFile } from "../schema/storage";
import { DB_TOKEN, Database } from "../index";
import { eq, and } from "drizzle-orm";

@Injectable()
export class FileRepository {
  constructor(@Inject(DB_TOKEN) private readonly db: Database) {}

  async create(data: NewFile): Promise<File> {
    const [result] = await this.db.insert(files).values(data).returning();
    return result;
  }

  async findById(id: string): Promise<File | undefined> {
    const [result] = await this.db
      .select()
      .from(files)
      .where(eq(files.id, id))
      .limit(1);
    return result;
  }

  async findByKey(key: string): Promise<File | undefined> {
    const [result] = await this.db
      .select()
      .from(files)
      .where(eq(files.key, key))
      .limit(1);
    return result;
  }

  async updateStatus(id: string, status: File["status"]): Promise<File> {
    const [result] = await this.db
      .update(files)
      .set({ status, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return result;
  }

  async listByWorkspace(workspaceId: string): Promise<File[]> {
    return await this.db
      .select()
      .from(files)
      .where(eq(files.workspaceId, workspaceId))
      .orderBy(files.createdAt);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(files).where(eq(files.id, id));
  }
}
