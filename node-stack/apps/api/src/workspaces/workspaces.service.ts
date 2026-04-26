import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CacheService } from "@node-stack/cache";
import { WorkspaceRepository, schema } from "@node-stack/db";
import type { UpdateMemberRoleDto, UpdateWorkspaceDto } from "@node-stack/validators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

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
    private readonly cache: CacheService,
    private readonly outbox: OutboxService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getMembers(
    workspaceId: string,
    currentUserId: string,
  ): Promise<MemberWithUser[]> {
    await this.validateMembership(workspaceId, currentUserId);

    const members = await this.workspaceRepo.findMembersByWorkspaceId(workspaceId);

    return members.map((m: any) => ({
      userId: m.userId,
      role: m.role as WorkspaceRole,
      createdAt: m.createdAt,
      user: {
        id: m.id,
        email: m.email,
        name: m.name,
        avatarUrl: m.avatarUrl,
      },
    }));
  }

  async getMyMembership(workspaceId: string, userId: string) {
    const membership = await this.workspaceRepo.findMembership(workspaceId, userId);
    if (!membership) throw new NotFoundException("Membership not found");
    return membership;
  }

  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    newRole: UpdateMemberRoleDto["role"],
    currentUserId: string,
  ): Promise<void> {
    await this.workspaceRepo.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      const currentMembership = await this.validateMembership(workspaceId, currentUserId);

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
    });

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
    await this.workspaceRepo.transaction(async (tx: NodePgDatabase<typeof schema>) => {
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
    });

    this.eventEmitter.emit("membership.removed", {
      workspaceId,
      userId: targetUserId,
      actorId: currentUserId,
    });

    await this.cache.invalidate(`workspaces:${workspaceId}:members`);
  }

  async validateMembership(workspaceId: string, userId: string) {
    const membership = await this.workspaceRepo.findMembership(workspaceId, userId);
    if (!membership) throw new ForbiddenException("Not a member of this workspace");
    return membership;
  }

  async createWorkspace(name: string, slug: string, userId: string) {
    const existing = await this.workspaceRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Workspace with slug "${slug}" already exists`);
    }

    const workspace = await this.workspaceRepo.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      const ws = await this.workspaceRepo.create({ name, slug }, tx);

      await this.workspaceRepo.createMembership({
        userId,
        workspaceId: ws.id,
        role: "owner",
      }, tx);

      await this.outbox.createEvent("workspace.created", { workspaceId: ws.id, userId, name }, tx);

      return ws;
    });

    this.eventEmitter.emit("workspace.created", {
      workspaceId: workspace.id,
      userId,
      name,
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
    await this.workspaceRepo.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      const currentMembership = await this.workspaceRepo.findMembership(workspaceId, currentUserId, tx);
      if (!currentMembership) throw new ForbiddenException("Not a member of this workspace");

      await this.workspaceRepo.createMembership({ workspaceId, userId: newUserId, role }, tx);
      await this.outbox.createEvent("membership.added", { workspaceId, userId: newUserId, role }, tx);
    });

    this.eventEmitter.emit("membership.added", {
      workspaceId,
      userId: newUserId,
      actorId: currentUserId,
      role,
    });

    await this.cache.invalidate(`workspaces:${workspaceId}:members`);
  }

  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceDto, currentUserId: string) {
    const currentMembership = await this.validateMembership(workspaceId, currentUserId);
    if (currentMembership.role !== "owner" && currentMembership.role !== "admin") {
      throw new ForbiddenException("Only owners and admins can update the workspace");
    }

    const updated = await this.workspaceRepo.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      const workspace = await this.workspaceRepo.update(workspaceId, data, tx);
      
      await this.outbox.createEvent("workspace.updated", {
        workspaceId,
        ...data,
      }, tx);

      return workspace;
    });

    this.eventEmitter.emit("workspace.updated", {
      workspaceId,
      ...data,
    });

    await this.cache.invalidate(`workspaces:${workspaceId}`);
    return updated;
  }

  async listWorkspaces(userId: string, cursor?: string, limit?: number) {
    return this.workspaceRepo.findAllByUserId(userId, cursor, limit);
  }

  async getUserWorkspaces(userId: string) {
    const { workspaces } = await this.workspaceRepo.findAllByUserId(userId);
    return workspaces;
  }
}

export type { MemberWithUser };

