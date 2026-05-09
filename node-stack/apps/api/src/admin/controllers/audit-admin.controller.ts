import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { AuditLogRepository, withSystemTx } from "@node-stack/db";
import type { Database } from "@node-stack/db";

import { AdminOnly } from "@/common/decorators/admin.decorator.js";

@ApiTags("admin-audit")
@Controller("admin/audit-logs")
@AdminOnly()
export class AuditAdminController {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  @Get()
  @ApiOperation({ summary: "List all audit logs cross-workspace (Admin only)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "action", required: false, type: String, description: "Filter by action (partial match)" })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "workspaceId", required: false, type: String })
  @ApiQuery({ name: "from", required: false, type: String, description: "ISO date" })
  @ApiQuery({ name: "to", required: false, type: String, description: "ISO date" })
  @ApiResponse({ status: 200, description: "Audit logs retrieved" })
  async listAuditLogs(
    @Query("page") page = 1,
    @Query("limit") limit = 50,
    @Query("action") action?: string,
    @Query("userId") userId?: string,
    @Query("workspaceId") workspaceId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ): Promise<{ data: Awaited<ReturnType<AuditLogRepository["findGlobal"]>>["logs"]; meta: { total: number; page: number; limit: number; pages: number } }> {
    const offset = (Number(page) - 1) * Number(limit);

    let result!: Awaited<ReturnType<AuditLogRepository["findGlobal"]>>;
    await withSystemTx(async (tx: Database) => {
      result = await this.auditLogRepository.findGlobal(
        {
          limit: Number(limit),
          offset,
          action,
          userId,
          workspaceId,
          from: from ? new Date(from) : undefined,
          to: to ? new Date(to) : undefined,
        },
        tx,
      );
    }, (this.auditLogRepository as unknown as { db: Database }).db);

    return {
      data: result.logs,
      meta: {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(result.total / Number(limit)),
      },
    };
  }
}
