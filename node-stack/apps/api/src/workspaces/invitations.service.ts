import { randomUUID } from "crypto";

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import {
  AuditLogRepository,
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

import { PlanLimitsService } from "@/billing/plan-limits.service.js";
import { OutboxService } from "@/common/services/outbox.service.js";

@Injectable()
export class InvitationsService {
  constructor(
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly invitationRepo: InvitationRepository,
    private readonly userRepo: UserRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly outbox: OutboxService,
    private readonly planLimits: PlanLimitsService,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  async createInvitation(
    workspaceId: string,
    dto: InviteMemberDto,
    invitedById: string,
  ): Promise<unknown> {
    // Enforce member limit before opening the transaction
    await this.planLimits.assertMemberLimit(workspaceId);

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

      await this.auditLog.create(
        {
          workspaceId,
          userId: invitedById,
          action: "workspace.member_invited",
          entityType: "invitation",
          entityId: newInvitation.id,
          metadata: { invitedEmail: dto.email, role: dto.role },
        },
        tx,
      );

      const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/invitations/${token}`;

      return {
        invitationId: newInvitation.id,
        token: newInvitation.token,
        expiresAt: newInvitation.expiresAt,
        link,
      };
    }, this.db);
  }

  async listPendingForUser(userId: string): Promise<unknown> {
    // Cross-tenant: a user can have invites from any workspace they're
    // not in yet, so withSystemTx; the email filter is the boundary.
    return withSystemTx(async (tx) => {
      const user = await this.userRepo.findById(userId);
      if (!user) throw new NotFoundException("User not found");
      return this.invitationRepo.findManyPendingByEmail(user.email, tx);
    }, this.db);
  }

  async listForWorkspace(workspaceId: string, currentUserId: string): Promise<unknown> {
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
  ): Promise<void> {
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

  async acceptInvitation(token: string, currentUserId: string): Promise<unknown> {
    // Pre-flight: resolve workspace from token (workspaceInvitations is not RLS-protected)
    // and enforce the member limit BEFORE opening the system transaction.
    // We can't nest withTenantTx inside withSystemTx, so this check happens here.
    const pendingInvite = await this.db.query.workspaceInvitations.findFirst({
      where: (inv, { eq: eqOp }) => eqOp(inv.token, token),
      columns: { workspaceId: true, status: true },
    });
    if (pendingInvite?.status === "pending" && pendingInvite.workspaceId) {
      await this.planLimits.assertMemberLimit(pendingInvite.workspaceId);
    }

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
        role: lockedInvitation.role as "owner" | "admin" | "member" | "guest",
      }, tx);

      await this.invitationRepo.update(lockedInvitation.id, { status: "accepted" }, tx);

      // Invited users join an existing workspace — they skip workspace creation
      // and pricing onboarding. Mark their onboarding as completed so the
      // ProtectedRoute guard doesn't bounce them to /onboarding.
      if (currentUser.onboardingStatus !== "completed") {
        await tx
          .update(schema.users)
          .set({ onboardingStatus: "completed" })
          .where(eq(schema.users.id, currentUserId));
      }

      await this.outbox.createEvent("invitation.accepted", {
        invitationId: lockedInvitation.id,
        workspaceId: lockedInvitation.workspaceId,
        userId: currentUserId,
      }, tx);

      await this.auditLog.create(
        {
          workspaceId: lockedInvitation.workspaceId,
          userId: currentUserId,
          action: "workspace.member_joined",
          entityType: "membership",
          entityId: currentUserId,
          metadata: { invitationId: lockedInvitation.id, role: lockedInvitation.role },
        },
        tx,
      );

      return {
        success: true,
        workspaceId: lockedInvitation.workspaceId,
        role: lockedInvitation.role,
      };
    }, this.db);
  }

  async getInvitationDetails(token: string): Promise<unknown> {
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
