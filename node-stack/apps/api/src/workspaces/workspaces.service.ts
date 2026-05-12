import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CacheService } from "@node-stack/cache";
import {
  AuditLogRepository,
  DB_TOKEN,
  WorkspaceRepository,
  schema,
  withSystemTx,
  withTenantTx,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";
import type { UpdateMemberRoleDto, UpdateWorkspaceDto } from "@node-stack/validators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { PlanLimitsService } from "@/billing/plan-limits.service.js";
import { OutboxService } from "@/common/services/outbox.service.js";

type WorkspaceRole = "owner" | "admin" | "member" | "guest";

interface MemberWithUser {
  userId: string;
  role: WorkspaceRole;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly cache: CacheService,
    private readonly outbox: OutboxService,
    private readonly eventEmitter: EventEmitter2,
    private readonly planLimits: PlanLimitsService,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  async getMembers(
    workspaceId: string,
    currentUserId: string,
  ): Promise<MemberWithUser[]> {
    return withTenantTx(workspaceId, async (tx: NodePgDatabase<typeof schema>) => {
      await this.validateMembership(workspaceId, currentUserId, tx);
      const members = await this.workspaceRepo.findMembersByWorkspaceId(workspaceId, tx);
      return members.map((m: Record<string, unknown>) => ({
        userId: m["userId"] as string,
        role: m["role"] as WorkspaceRole,
        createdAt: m["createdAt"] as Date,
        user: {
          id: m["id"] as string,
          email: m["email"] as string,
          name: m["name"] as string | null,
          avatarUrl: m["avatarUrl"] as string | null,
        },
      }));
    }, this.db);
  }

  async getMyMembership(workspaceId: string, userId: string): Promise<unknown> {
    return withTenantTx(workspaceId, async (tx: NodePgDatabase<typeof schema>) => {
      const membership = await this.workspaceRepo.findMembership(workspaceId, userId, tx);
      if (!membership) throw new NotFoundException("Membership not found");
      return membership;
    }, this.db);
  }

  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    newRole: UpdateMemberRoleDto["role"],
    currentUserId: string,
  ): Promise<void> {
    await withTenantTx(workspaceId, async (tx: NodePgDatabase<typeof schema>) => {
      const currentMembership = await this.validateMembership(workspaceId, currentUserId, tx);

      const targetMembership = await this.workspaceRepo.findMembership(workspaceId, targetUserId, tx);
      if (!targetMembership) throw new NotFoundException("Member not found in workspace");

      const targetRole = targetMembership.role as WorkspaceRole;
      if (targetRole === "owner") throw new ForbiddenException("Cannot change owner role");

      const currentRole = currentMembership.role as WorkspaceRole;
      if (currentRole === "admin" && targetRole === "admin") {
        throw new ForbiddenException("Admins cannot modify other admins");
      }

      await this.workspaceRepo.updateMembership(workspaceId, targetUserId, { role: newRole }, tx);

      await this.outbox.createEvent("membership.updated", {
        workspaceId,
        userId: targetUserId,
        role: newRole,
      }, tx);

      await this.auditLog.create(
        {
          workspaceId,
          userId: currentUserId,
          action: "workspace.member_role_changed",
          entityType: "membership",
          entityId: targetUserId,
          metadata: { newRole, previousRole: targetRole },
        },
        tx,
      );
    }, this.db);

    this.eventEmitter.emit("membership.updated", {
      workspaceId,
      userId: targetUserId,
      actorId: currentUserId,
      role: newRole,
    });

    await this.cache.invalidate(`workspaces:${workspaceId}:members`);
  }

  async removeMember(
    workspaceId: string,
    targetUserId: string,
    currentUserId: string,
  ): Promise<void> {
    await withTenantTx(workspaceId, async (tx: NodePgDatabase<typeof schema>) => {
      const currentMembership = await this.workspaceRepo.findMembership(workspaceId, currentUserId, tx);
      if (!currentMembership) throw new ForbiddenException("Not a member of this workspace");

      const targetMembership = await this.workspaceRepo.findMembership(workspaceId, targetUserId, tx);
      if (!targetMembership) throw new NotFoundException("Member not found");

      const targetRole = targetMembership.role as WorkspaceRole;
      if (targetRole === "owner") throw new ForbiddenException("Cannot remove workspace owner");

      const currentRole = currentMembership.role as WorkspaceRole;
      if (currentRole === "admin" && targetRole === "admin") {
        throw new ForbiddenException("Admins cannot remove other admins");
      }

      await this.workspaceRepo.deleteMembership(workspaceId, targetUserId, tx);
      await this.outbox.createEvent("membership.removed", { workspaceId, userId: targetUserId }, tx);

      await this.auditLog.create(
        {
          workspaceId,
          userId: currentUserId,
          action: "workspace.member_removed",
          entityType: "membership",
          entityId: targetUserId,
          metadata: { role: targetRole },
        },
        tx,
      );
    }, this.db);

    this.eventEmitter.emit("membership.removed", {
      workspaceId,
      userId: targetUserId,
      actorId: currentUserId,
    });

    await this.cache.invalidate(`workspaces:${workspaceId}:members`);
  }

  async validateMembership(
    workspaceId: string,
    userId: string,
    tx?: NodePgDatabase<typeof schema>,
  ): Promise<{ role: string; [key: string]: unknown }> {
    const membership = await this.workspaceRepo.findMembership(workspaceId, userId, tx);
    if (!membership) throw new ForbiddenException("Not a member of this workspace");
    return membership;
  }

  async createWorkspace(
    name: string,
    slug: string | undefined,
    userId: string,
    metadata: { industry?: string; teamSize?: string; revenueRange?: string } = {},
  ): Promise<unknown> {
    // Enforce workspace limit before any DB writes
    await this.planLimits.assertWorkspaceLimit(userId);

    // Auto-generate slug from name when not provided (onboarding flow)
    const resolvedSlug = slug ??
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

    // No workspaceId yet — withSystemTx so the inserts into workspaces +
    // memberships + outbox satisfy the system-bypass RLS policy.
    const workspace = await withSystemTx(async (tx: NodePgDatabase<typeof schema>) => {
      const existing = await this.workspaceRepo.findBySlug(resolvedSlug, tx);
      if (existing) {
        throw new ConflictException(`Workspace with slug "${resolvedSlug}" already exists`);
      }

      const ws = await this.workspaceRepo.create({
        name,
        slug: resolvedSlug,
        industry: metadata.industry,
        teamSize: metadata.teamSize,
        revenueRange: metadata.revenueRange,
      }, tx);

      await this.workspaceRepo.createMembership({
        userId,
        workspaceId: ws.id,
        role: "owner",
      }, tx);

      await this.outbox.createEvent("workspace.created", { workspaceId: ws.id, userId, name }, tx);

      await this.auditLog.create(
        {
          workspaceId: ws.id,
          userId,
          action: "workspace.created",
          entityType: "workspace",
          entityId: ws.id,
          metadata: { name, slug },
        },
        tx,
      );

      return ws;
    }, this.db);

    // Fetch user data to enrich the workspace.created event with marketing context
    const creator = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
      columns: { email: true, name: true, phone: true },
    });

    this.eventEmitter.emit("workspace.created", {
      workspaceId: workspace.id,
      userId,
      name,
      userEmail: creator?.email,
      userPhone: creator?.phone ?? undefined,
      userFirstName: creator?.name ?? undefined,
    });

    await this.cache.invalidate(`workspaces:${workspace.id}`);
    return workspace;
  }

  async addMember(
    workspaceId: string,
    newUserId: string,
    currentUserId: string,
    role: WorkspaceRole = "member",
  ): Promise<void> {
    await withTenantTx(workspaceId, async (tx: NodePgDatabase<typeof schema>) => {
      const currentMembership = await this.workspaceRepo.findMembership(workspaceId, currentUserId, tx);
      if (!currentMembership) throw new ForbiddenException("Not a member of this workspace");

      await this.workspaceRepo.createMembership({ workspaceId, userId: newUserId, role }, tx);
      await this.outbox.createEvent("membership.added", { workspaceId, userId: newUserId, role }, tx);

      await this.auditLog.create(
        {
          workspaceId,
          userId: currentUserId,
          action: "workspace.member_added",
          entityType: "user",
          entityId: newUserId,
          metadata: { role },
        },
        tx,
      );
    }, this.db);

    this.eventEmitter.emit("membership.added", {
      workspaceId,
      userId: newUserId,
      actorId: currentUserId,
      role,
    });

    await this.cache.invalidate(`workspaces:${workspaceId}:members`);
  }

  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceDto, currentUserId: string): Promise<unknown> {
    const updated = await withTenantTx(workspaceId, async (tx: NodePgDatabase<typeof schema>) => {
      const currentMembership = await this.validateMembership(workspaceId, currentUserId, tx);
      if (currentMembership.role !== "owner" && currentMembership.role !== "admin") {
        throw new ForbiddenException("Only owners and admins can update the workspace");
      }

      const workspace = await this.workspaceRepo.update(workspaceId, data, tx);

      await this.outbox.createEvent("workspace.updated", {
        workspaceId,
        ...data,
      }, tx);

      return workspace;
    }, this.db);

    this.eventEmitter.emit("workspace.updated", {
      workspaceId,
      ...data,
    });

    await this.cache.invalidate(`workspaces:${workspaceId}`);
    return updated;
  }

  async listWorkspaces(userId: string, cursor?: string, limit?: number): Promise<unknown> {
    // Cross-tenant query (a user's workspaces span multiple tenants);
    // withSystemTx so the JOIN against memberships+workspaces is not
    // filtered by a single workspace GUC. The existing user_id WHERE
    // filter is the security boundary here, not RLS.
    return withSystemTx(
      (tx: NodePgDatabase<typeof schema>) =>
        this.workspaceRepo.findAllByUserId(userId, cursor, limit, tx),
      this.db,
    );
  }

  async getUserWorkspaces(userId: string): Promise<unknown> {
    const { workspaces } = await withSystemTx(
      (tx: NodePgDatabase<typeof schema>) =>
        this.workspaceRepo.findAllByUserId(userId, undefined, undefined, tx),
      this.db,
    );
    return workspaces;
  }
}

export type { MemberWithUser };

