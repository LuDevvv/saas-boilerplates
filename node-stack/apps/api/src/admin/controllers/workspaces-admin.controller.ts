import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from "@nestjs/swagger";
import type { Database } from "@node-stack/db";
import { WorkspaceRepository, withSystemTx , schema } from "@node-stack/db";
import { desc, isNull, count, eq } from "drizzle-orm";

import { AdminOnly } from "@/common/decorators/admin.decorator.js";

interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  tier: string;
  memberCount: number;
  deletedAt: Date | null;
  createdAt: Date;
}

interface WorkspacesListResult {
  data: WorkspaceSummary[];
  meta: { total: number; page: number; limit: number; pages: number };
}

@ApiTags("admin-workspaces")
@Controller("admin/workspaces")
@AdminOnly()
export class WorkspacesAdminController {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  @Get()
  @ApiOperation({ summary: "List all workspaces (Admin only)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "includeDeleted", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "Workspaces list" })
  async listWorkspaces(
    @Query("page") page = 1,
    @Query("limit") limit = 20,
    @Query("includeDeleted") includeDeleted?: string,
  ): Promise<WorkspacesListResult> {
    const offset = (Number(page) - 1) * Number(limit);
    const showDeleted = includeDeleted === "true";

    let workspaces!: WorkspaceSummary[];
    let total!: number;

    await withSystemTx(async (tx: Database) => {
      const where = showDeleted ? undefined : isNull(schema.workspaces.deletedAt);

      type WorkspaceRow = typeof schema.workspaces.$inferSelect & {
        memberships: { id: string }[];
      };

      const [rows, countRows] = await Promise.all([
        tx.query.workspaces.findMany({
          where,
          limit: Number(limit),
          offset,
          orderBy: [desc(schema.workspaces.createdAt)],
          with: {
            memberships: {
              columns: { id: true },
            },
          },
        }) as Promise<WorkspaceRow[]>,
        tx.select({ total: count(schema.workspaces.id) })
          .from(schema.workspaces)
          .where(where),
      ]);

      workspaces = rows.map((ws) => ({
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        logoUrl: ws.logoUrl,
        tier: (ws as unknown as { tier?: string }).tier ?? "free",
        memberCount: ws.memberships?.length ?? 0,
        deletedAt: ws.deletedAt,
        createdAt: ws.createdAt,
      }));
      total = countRows[0]?.total ?? 0;
    }, (this.workspaceRepository as unknown as { db: Database }).db);

    return {
      data: workspaces,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get workspace detail (Admin only)" })
  @ApiParam({ name: "id", description: "Workspace ID" })
  @ApiResponse({ status: 200, description: "Workspace detail" })
  async getWorkspace(@Param("id") id: string): Promise<unknown> {
    let workspace: unknown = null;

    await withSystemTx(async (tx: Database) => {
      const ws = await tx.query.workspaces.findFirst({
        where: eq(schema.workspaces.id, id),
        with: {
          memberships: {
            with: { user: { columns: { id: true, email: true, name: true, role: true } } },
          },
        },
      });
      workspace = ws ?? null;
    }, (this.workspaceRepository as unknown as { db: Database }).db);

    return workspace;
  }
}
