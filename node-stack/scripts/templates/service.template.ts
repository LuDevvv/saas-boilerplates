import { Injectable, Logger, NotFoundException, ForbiddenException } from "@nestjs/common";
import { {!!ModuleName}Repository } from "@node-stack/db";
import { type {!!ModuleName}, type New{!!ModuleName} } from "@node-stack/db";
import {
  Create{!!ModuleName}Dto,
  Update{!!ModuleName}Dto,
} from "@node-stack/validators";

@Injectable()
export class {!!ModuleName}Service {
  private readonly logger = new Logger({!!ModuleName}Service.name);

  constructor(
    private readonly {!!moduleNameCamel}Repository: {!!ModuleName}Repository,
  ) {}

  /**
   * Create a new {!!moduleName}
   */
  async create(
    workspaceId: string,
    userId: string,
    dto: Create{!!ModuleName}Dto,
  ): Promise<{!!ModuleName}> {
    this.logger.debug(`Creating {!!moduleName} in workspace ${workspaceId}`);

    const data: New{!!ModuleName} = {
      workspaceId,
      name: dto.name,
      description: dto.description,
      createdBy: userId,
      status: "pending",
    };

    const {!!moduleNameCamel} = await this.{!!moduleNameCamel}Repository.create(data);
    
    this.logger.log(`Created {!!moduleName} ${this.{!!moduleNameCamel}.id} in workspace ${workspaceId}`);
    
    return {!!moduleNameCamel};
  }

  /**
   * List {!!moduleNamePlural} for a workspace
   */
  async list(
    workspaceId: string,
    query: { status?: string; cursor?: string; limit?: number },
  ): Promise<{ data: {!!ModuleName}[]; nextCursor?: string }> {
    const { status, cursor, limit = 20 } = query;

    let {!!moduleNamePlural}: {!!ModuleName}[];
    
    if (status) {
      {!!moduleNamePlural} = await this.{!!moduleNameCamel}Repository.findByWorkspaceAndStatus(
        workspaceId,
        status as {!!ModuleName}["status"]
      );
    } else {
      {!!moduleNamePlural} = await this.{!!moduleNameCamel}Repository.findByWorkspace(workspaceId);
    }

    // Apply cursor pagination if provided
    if (cursor) {
      const cursorIndex = {!!moduleNamePlural}.findIndex(t => t.id === cursor);
      if (cursorIndex !== -1) {
        {!!moduleNamePlural} = {!!moduleNamePlural}.slice(cursorIndex + 1);
      }
    }

    // Apply limit
    const limitedData = {!!moduleNamePlural}.slice(0, limit);
    const nextCursor = limitedData.length === limit ? limitedData[limitedData.length - 1]?.id : undefined;

    return {
      data: limitedData,
      nextCursor,
    };
  }

  /**
   * Find a {!!moduleName} by ID (with workspace validation)
   */
  async findById(workspaceId: string, id: string): Promise<{!!ModuleName}> {
    const {!!moduleNameCamel} = await this.{!!moduleNameCamel}Repository.findById(id);

    if (!{!!moduleNameCamel}) {
      throw new NotFoundException(`{!!ModuleName} not found`);
    }

    // Verify workspace ownership
    if ({!!moduleNameCamel}.workspaceId !== workspaceId) {
      throw new ForbiddenException(`Access denied to this {!!moduleName}`);
    }

    return {!!moduleNameCamel};
  }

  /**
   * Update a {!!moduleName}
   */
  async update(
    workspaceId: string,
    id: string,
    dto: Update{!!ModuleName}Dto,
  ): Promise<{!!ModuleName}> {
    // First verify access
    await this.findById(workspaceId, id);

    const updated = await this.{!!moduleNameCamel}Repository.update(id, dto);

    if (!updated) {
      throw new NotFoundException(`{!!ModuleName} not found`);
    }

    this.logger.log(`Updated {!!moduleName} ${id}`);
    
    return updated;
  }

  /**
   * Soft delete a {!!moduleName}
   */
  async softDelete(workspaceId: string, id: string): Promise<void> {
    // Verify access first
    await this.findById(workspaceId, id);

    await this.{!!moduleNameCamel}Repository.softDelete(id);
    
    this.logger.log(`Soft deleted {!!moduleName} ${id}`);
  }
}
