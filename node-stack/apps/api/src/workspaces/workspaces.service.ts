import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { CacheService } from "@node-stack/cache";
import { WorkspaceRepository, schema } from "@node-stack/db";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { UpdateMemberRoleDto } from "@node-stack/validators";
import { OutboxService } from "../common/services/outbox.service";

type WorkspaceRole = "owner" | "admin" | "member";

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
  ) {}

  async getMembers(
    workspaceId: string,
    currentUserId: string,
  ): Promise<MemberWithUser[]> {
    await this.validateMembership(workspaceId, currentUserId);

    const members = await this.workspaceRepo.findMembersByWorkspaceId(workspaceId);

    return members.map((m) => ({
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
    const currentMembership = await this.validateMembership(workspaceId, currentUserId);

    const targetMembership = await this.workspaceRepo.findMembership(workspaceId, targetUserId);
    if (!targetMembership) throw new NotFoundException("Member not found in workspace");

    const targetRole = targetMembership.role as WorkspaceRole;
    if (targetRole === "owner") throw new ForbiddenException("Cannot change owner role");

    const currentRole = currentMembership.role as WorkspaceRole;
    if (currentRole === "admin" && targetRole === "admin") {
      throw new ForbiddenException("Admins cannot modify other admins");
    }

    await this.workspaceRepo.updateMembership(workspaceId, targetUserId, { role: newRole });
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

    await this.cache.invalidate(`workspaces:${workspaceId}:members`);
  }

  async validateMembership(workspaceId: string, userId: string) {
    const membership = await this.workspaceRepo.findMembership(workspaceId, userId);
    if (!membership) throw new ForbiddenException("Not a member of this workspace");
    return membership;
  }

  async createWorkspace(name: string, slug: string, userId: string) {
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

    await this.cache.invalidate(`workspaces:${workspaceId}:members`);
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

