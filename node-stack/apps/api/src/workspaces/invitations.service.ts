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
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { InviteDto } from "./dto/invite.dto";
import { OutboxService } from "../common/services/outbox.service";

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
    dto: InviteDto,
    invitedById: string,
  ) {
    // Validate workspace exists
    const workspace = await this.workspaceRepo.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    // Check if current user is admin/owner
    const inviterMembership = await this.workspaceRepo.findMembership(
      workspaceId,
      invitedById,
    );
    if (!inviterMembership) {
      throw new UnauthorizedException("You are not a member of this workspace");
    }
    // Guard moved to RBAC layer; no inline admin/member check here

    // Check if email is already a member
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      const existingMember = await this.workspaceRepo.findMembership(
        workspaceId,
        existingUser.id,
      );
      if (existingMember) {
        throw new ConflictException(
          "User is already a member of this workspace",
        );
      }
    }

    // Prevent duplicate pending invitation
    const pendingInvite =
      await this.invitationRepo.findPendingByEmailAndWorkspace(
        dto.email,
        workspaceId,
      );
    if (pendingInvite) {
      throw new ConflictException(
        "A pending invitation already exists for this email",
      );
    }

    // Generate token and expiry (7 days)
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation + outbox event atomically
    return await this.workspaceRepo.transaction(async (tx: any) => {
        const newInvitation = await this.invitationRepo.create(
          {
            workspaceId,
            email: dto.email,
            role: dto.role || "member",
            invitedById,
            expiresAt,
            token,
          },
          tx,
        );

        await this.outbox.createEvent(
          "invitation.sent",
          {
            invitationId: newInvitation.id,
            email: dto.email,
            workspaceId,
            token,
            expiresAt: expiresAt.toISOString(),
          },
          tx,
        );

        const link = `${process.env.APP_URL || "http://localhost:4000"}/workspace-invitations/${token}/accept`;

        return {
          invitationId: newInvitation.id,
          token: newInvitation.token,
          expiresAt: newInvitation.expiresAt,
          link,
        };
      },
    );
  }

  async listPendingForUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.invitationRepo.findManyPendingByEmail(user.email);
  }

  async listForWorkspace(workspaceId: string, currentUserId: string) {
    const membership = await this.workspaceRepo.findMembership(
      workspaceId,
      currentUserId,
    );
    if (!membership) {
      throw new UnauthorizedException("You are not a member of this workspace");
    }
    // Guard moved to RBAC layer; remove inline role check for listing invitations

    return this.invitationRepo.findManyByWorkspace(workspaceId);
  }

  async cancelInvitation(
    workspaceId: string,
    invitationId: string,
    currentUserId: string,
  ) {
    const membership = await this.workspaceRepo.findMembership(
      workspaceId,
      currentUserId,
    );
    if (!membership) {
      throw new UnauthorizedException("You are not a member of this workspace");
    }
    if (membership.role === "member") {
      throw new UnauthorizedException(
        "Only admins or owners can cancel invitations",
      );
    }

    const invitation = await this.invitationRepo.findById(invitationId);
    if (
      !invitation ||
      invitation.workspaceId !== workspaceId ||
      invitation.status !== "pending"
    ) {
      throw new NotFoundException("Invitation not found or already used");
    }

    await this.invitationRepo.delete(invitationId);
  }

  async acceptInvitation(token: string, currentUserId: string) {
    return this.workspaceRepo.transaction(async (tx: any) => {
        // Acquire a pessimistic row-level lock (SELECT ... FOR UPDATE) to prevent
        // TOCTOU race conditions. Any concurrent transaction trying to accept the
        // same invitation will block here until this transaction commits or rolls back.
        // TODO: Move to InvitationRepository with tx support (findByTokenForUpdate)
        const [lockedInvitation] = await tx
          .select()
          .from(schema.workspaceInvitations)
          .where(eq(schema.workspaceInvitations.token, token))
          .for("update");

        if (!lockedInvitation) {
          throw new NotFoundException("Invalid or used invitation token");
        }

        this.logger.debug(
          `[InvitationsService] Row locked for invitation: ${lockedInvitation.id}`,
        );

        // Validate status AFTER acquiring the lock — another transaction may have
        // already changed it from 'pending' to 'accepted' or 'expired'
        if (lockedInvitation.status !== "pending") {
          throw new NotFoundException("Invalid or used invitation token");
        }

        if (lockedInvitation.expiresAt < new Date()) {
          await this.invitationRepo.update(
            lockedInvitation.id,
            { status: "expired" },
            tx,
          );
          throw new BadRequestException("Invitation has expired");
        }

        // Check if user is already a member
        const existingMembership = await this.workspaceRepo.findMembership(
          lockedInvitation.workspaceId,
          currentUserId,
          tx,
        );
        if (existingMembership) {
          throw new ConflictException(
            "You are already a member of this workspace",
          );
        }

        // Create membership
        await this.workspaceRepo.createMembership(
          {
            userId: currentUserId,
            workspaceId: lockedInvitation.workspaceId,
            role: lockedInvitation.role as "admin" | "owner" | "member",
          },
          tx,
        );

        // Mark invitation as accepted
        await this.invitationRepo.update(
          lockedInvitation.id,
          { status: "accepted" },
          tx,
        );

        // Emit outbox events
        await this.outbox.createEvent(
          "invitation.accepted",
          {
            invitationId: lockedInvitation.id,
            workspaceId: lockedInvitation.workspaceId,
            userId: currentUserId,
          },
          tx,
        );

        return {
          success: true,
          message: "Invitation accepted successfully",
          workspaceId: lockedInvitation.workspaceId,
          role: lockedInvitation.role,
        };
      },
    );
  }

  async getInvitationDetails(token: string) {
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation || invitation.status !== "pending") {
      throw new NotFoundException("Invalid or used invitation token");
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
