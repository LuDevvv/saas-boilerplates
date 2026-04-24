import { Injectable, Inject } from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";
import { {!!moduleNamePlural}, type {!!ModuleName}, type New{!!ModuleName} } from "../schema/{!!moduleNamePlural}.js";

@Injectable()
export class {!!ModuleName}Repository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Find a single {!!moduleName} by ID
   */
  async findById(id: string): Promise<{!!ModuleName} | undefined> {
    const [result] = await this.db
      .select()
      .from({!!moduleNamePlural})
      .where(eq({!!moduleNamePlural}.id, id))
      .limit(1);
    return result;
  }

  /**
   * Find {!!moduleName} by workspace
   */
  async findByWorkspace(workspaceId: string): Promise<{!!ModuleName}[]> {
    return this.db
      .select()
      .from({!!moduleNamePlural})
      .where(eq({!!moduleNamePlural}.workspaceId, workspaceId))
      .orderBy(desc({!!moduleNamePlural}.createdAt));
  }

  /**
   * Find {!!moduleName} by workspace and status
   */
  async findByWorkspaceAndStatus(
    workspaceId: string,
    status: {!!ModuleName}["status"]
  ): Promise<{!!ModuleName}[]> {
    return this.db
      .select()
      .from({!!moduleNamePlural})
      .where(
        and(
          eq({!!moduleNamePlural}.workspaceId, workspaceId),
          eq({!!moduleNamePlural}.status, status)
        )
      )
      .orderBy(desc({!!moduleNamePlural}.createdAt));
  }

  /**
   * Create a new {!!moduleName}
   */
  async create(data: New{!!ModuleName}): Promise<{!!ModuleName}> {
    const [result] = await this.db
      .insert({!!moduleNamePlural})
      .values(data)
      .returning();
    return result;
  }

  /**
   * Update a {!!moduleName}
   */
  async update(id: string, data: Partial<New{!!ModuleName}>): Promise<{!!ModuleName} | undefined> {
    const [result] = await this.db
      .update({!!moduleNamePlural})
      .set(data)
      .where(eq({!!moduleNamePlural}.id, id))
      .returning();
    return result;
  }

  /**
   * Soft delete a {!!moduleName}
   */
  async softDelete(id: string): Promise<void> {
    await this.db
      .update({!!moduleNamePlural})
      .set({ status: "deleted", deletedAt: new Date() })
      .where(eq({!!moduleNamePlural}.id, id));
  }

  /**
   * Hard delete a {!!moduleName}
   */
  async delete(id: string): Promise<void> {
    await this.db
      .delete({!!moduleNamePlural})
      .where(eq({!!moduleNamePlural}.id, id));
  }
}
