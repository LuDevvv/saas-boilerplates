import { randomUUID } from "crypto";

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
  Inject,
} from "@nestjs/common";
import {
  WorkspaceRepository,
  InvitationRepository,
  UserRepository,
  DB_TOKEN,
  schema,
  eq,
  withSystemTx,
  withTenantTx,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";
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
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  async createInvitation(
    workspaceId: string,
    dto: InviteMemberDto,
    invitedById: string,
  ) {
    return withTenantTx(workspaceId, async (tx: NodePgDatabase<typeof schema>) => {
      const workspace = await this.workspaceRepo.findById(workspaceId, tx);
      if (!workspace) throw new NotFoundException("Workspace not found");

      const inviterMembership = await this.workspaceRepo.findMembership(workspaceId, invitedById, tx);
      if (!inviterMembership) throw new UnauthorizedException("Not a member of this workspace");

      const existingUser = await this.userRepo.findByEmail(dto.email);
      if (existingUser) {
        const existingMember = await this.workspaceRepo.findMembership(workspaceId, existingUser.id, tx);
        if (existingMember) throw new ConflictException("User is already a member");
      }

      const pendingInvite = await this.invitationRepo.findPendingByEmailAndWorkspace(dto.email, workspaceId, tx);
      if (pendingInvite) throw new ConflictException("A pending invitation already exists");

      const token = randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

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
    }, this.db);
  }

  async listPendingForUser(userId: string) {
    // Cross-tenant: a user can have invites from any workspace they're
    // not in yet, so withSystemTx; the email filter is the boundary.
    return withSystemTx(async (tx) => {
      const user = await this.userRepo.findById(userId);
      if (!user) throw new NotFoundException("User not found");
      return this.invitationRepo.findManyPendingByEmail(user.email, tx);
    }, this.db);
  }

  async listForWorkspace(workspaceId: string, currentUserId: string) {
    return withTenantTx(workspaceId, async (tx) => {
      const membership = await this.workspaceRepo.findMembership(workspaceId, currentUserId, tx);
      if (!membership) throw new UnauthorizedException("Not a member");
      return this.invitationRepo.findManyByWorkspace(workspaceId, tx);
    }, this.db);
  }

  async cancelInvitation(
    workspaceId: string,
    invitationId: string,
    currentUserId: string,
  ) {
    await withTenantTx(workspaceId, async (tx) => {
      const membership = await this.workspaceRepo.findMembership(workspaceId, currentUserId, tx);
      if (!membership) throw new UnauthorizedException("Not a member");

      if (membership.role === "member") {
        throw new UnauthorizedException("Only admins or owners can cancel invitations");
      }

      const invitation = await this.invitationRepo.findById(invitationId, tx);
      if (!invitation || invitation.workspaceId !== workspaceId || invitation.status !== "pending") {
        throw new NotFoundException("Invitation not found");
      }

      await this.invitationRepo.delete(invitationId, tx);
    }, this.db);
  }

  async acceptInvitation(token: string, currentUserId: string) {
    // Cross-tenant: the token resolves to a workspace we don't know yet.
    // withSystemTx for the lookup + atomic membership creation. The email
    // match against currentUser is the security boundary inside.
    return withSystemTx(async (tx: NodePgDatabase<typeof schema>) => {
      const currentUser = await this.userRepo.findById(currentUserId);
      if (!currentUser) throw new UnauthorizedException("User not found");

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
    }, this.db);
  }

  async getInvitationDetails(token: string) {
    // Token-based lookup: workspace not known up front, withSystemTx.
    return withSystemTx(async (tx) => {
      const invitation = await this.invitationRepo.findByToken(token, tx);
      if (!invitation || invitation.status !== "pending") {
        throw new NotFoundException("Invalid invitation");
      }

      if (invitation.expiresAt < new Date()) {
        await this.invitationRepo.update(invitation.id, { status: "expired" }, tx);
        throw new BadRequestException("Invitation has expired");
      }

      const workspace = await this.workspaceRepo.findById(invitation.workspaceId, tx);
      const inviter = await this.userRepo.findById(invitation.invitedById);

      return {
        workspaceName: workspace?.name,
        inviterName: inviter?.name || inviter?.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      };
    }, this.db);
  }
}
