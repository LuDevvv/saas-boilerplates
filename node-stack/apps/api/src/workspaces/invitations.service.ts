import { randomUUID } from "crypto";

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import {
  WorkspaceRepository,
  InvitationRepository,
  UserRepository,
  schema,
  eq,
} from "@node-stack/db";
import type { InviteMemberDto } from "@node-stack/validators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { OutboxService } from "@/common/services/outbox.service.js";

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly invitationRepo: InvitationRepository,
    private readonly userRepo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async createInvitation(
    workspaceId: string,
    dto: InviteMemberDto,
    invitedById: string,
  ) {
    const workspace = await this.workspaceRepo.findById(workspaceId);
    if (!workspace) throw new NotFoundException("Workspace not found");

    const inviterMembership = await this.workspaceRepo.findMembership(workspaceId, invitedById);
    if (!inviterMembership) throw new UnauthorizedException("Not a member of this workspace");

    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      const existingMember = await this.workspaceRepo.findMembership(workspaceId, existingUser.id);
      if (existingMember) throw new ConflictException("User is already a member");
    }

    const pendingInvite = await this.invitationRepo.findPendingByEmailAndWorkspace(dto.email, workspaceId);
    if (pendingInvite) throw new ConflictException("A pending invitation already exists");

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return await this.workspaceRepo.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      const newInvitation = await this.invitationRepo.create({
        workspaceId,
        email: dto.email,
        role: dto.role,
        invitedById,
        expiresAt,
        token,
      }, tx);

      await this.outbox.createEvent("invitation.sent", {
        invitationId: newInvitation.id,
        email: dto.email,
        workspaceId,
        token,
        expiresAt: expiresAt.toISOString(),
      }, tx);

      const link = `${process.env.APP_URL || "http://localhost:4000"}/workspace-invitations/${token}/accept`;

      return {
        invitationId: newInvitation.id,
        token: newInvitation.token,
        expiresAt: newInvitation.expiresAt,
        link,
      };
    });
  }

  async listPendingForUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    return this.invitationRepo.findManyPendingByEmail(user.email);
  }

  async listForWorkspace(workspaceId: string, currentUserId: string) {
    const membership = await this.workspaceRepo.findMembership(workspaceId, currentUserId);
    if (!membership) throw new UnauthorizedException("Not a member");
    return this.invitationRepo.findManyByWorkspace(workspaceId);
  }

  async cancelInvitation(
    workspaceId: string,
    invitationId: string,
    currentUserId: string,
  ) {
    const membership = await this.workspaceRepo.findMembership(workspaceId, currentUserId);
    if (!membership) throw new UnauthorizedException("Not a member");
    
    if (membership.role === "member") {
      throw new UnauthorizedException("Only admins or owners can cancel invitations");
    }

    const invitation = await this.invitationRepo.findById(invitationId);
    if (!invitation || invitation.workspaceId !== workspaceId || invitation.status !== "pending") {
      throw new NotFoundException("Invitation not found");
    }

    await this.invitationRepo.delete(invitationId);
  }

  async acceptInvitation(token: string, currentUserId: string) {
    const currentUser = await this.userRepo.findById(currentUserId);
    if (!currentUser) throw new UnauthorizedException("User not found");

    return this.workspaceRepo.transaction(async (tx: NodePgDatabase<typeof schema>) => {
      // Row lock for safety
      const [lockedInvitation] = await tx
        .select()
        .from(schema.workspaceInvitations)
        .where(eq(schema.workspaceInvitations.token, token))
        .for("update");

      if (!lockedInvitation || lockedInvitation.status !== "pending") {
        throw new NotFoundException("Invalid or used invitation token");
      }

      if (lockedInvitation.expiresAt < new Date()) {
        await this.invitationRepo.update(lockedInvitation.id, { status: "expired" }, tx);
        throw new BadRequestException("Invitation has expired");
      }

      if (currentUser.email.toLowerCase() !== lockedInvitation.email.toLowerCase()) {
        throw new UnauthorizedException("You can only accept invitations sent to your email address");
      }

      const existingMembership = await this.workspaceRepo.findMembership(lockedInvitation.workspaceId, currentUserId, tx);
      if (existingMembership) throw new ConflictException("Already a member");

      await this.workspaceRepo.createMembership({
        userId: currentUserId,
        workspaceId: lockedInvitation.workspaceId,
        role: lockedInvitation.role as any,
      }, tx);

      await this.invitationRepo.update(lockedInvitation.id, { status: "accepted" }, tx);

      await this.outbox.createEvent("invitation.accepted", {
        invitationId: lockedInvitation.id,
        workspaceId: lockedInvitation.workspaceId,
        userId: currentUserId,
      }, tx);

      return {
        success: true,
        workspaceId: lockedInvitation.workspaceId,
        role: lockedInvitation.role,
      };
    });
  }

  async getInvitationDetails(token: string) {
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation || invitation.status !== "pending") {
      throw new NotFoundException("Invalid invitation");
    }

    if (invitation.expiresAt < new Date()) {
      await this.invitationRepo.update(invitation.id, { status: "expired" });
      throw new BadRequestException("Invitation has expired");
    }

    const workspace = await this.workspaceRepo.findById(invitation.workspaceId);
    const inviter = await this.userRepo.findById(invitation.invitedById);

    return {
      workspaceName: workspace?.name,
      inviterName: inviter?.name || inviter?.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    };
  }
}
