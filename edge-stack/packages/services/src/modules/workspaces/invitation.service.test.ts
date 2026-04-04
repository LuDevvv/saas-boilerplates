import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createInvitationService } from "./invitation.service";
import {
  createTestDb,
  closeTestDb,
  testWorkspaces,
  testInvitations,
  testMemberships,
  testUsers,
} from "@workspace/testing";
import { InvitationRepository } from "@workspace/db";

// Redireccionamos los esquemas de Postgres a las tablas de SQLite de prueba
vi.mock("@workspace/db", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  const { testInvitations, testMemberships } =
    await import("@workspace/testing");
  const { eq } = await import("drizzle-orm");

  return {
    ...actual,
    InvitationRepository: {
      createInvitation: vi.fn().mockImplementation(async (db, data) => {
        const id = crypto.randomUUID();
        const invitation = {
          id,
          ...data,
          status: "pending",
          createdAt: new Date().toISOString(),
          expiresAt:
            data.expiresAt instanceof Date
              ? data.expiresAt.toISOString()
              : data.expiresAt,
        };
        await db.insert(testInvitations).values(invitation).run();
        return invitation;
      }),
      getInvitationByToken: vi.fn().mockImplementation(async (db, token) => {
        const row = await db
          .select()
          .from(testInvitations)
          .where(eq(testInvitations.token, token))
          .get();
        if (!row) return null;
        return {
          ...row,
          expiresAt: new Date(row.expiresAt),
        };
      }),
      deleteInvitation: vi.fn().mockImplementation(async (db, id) => {
        return db
          .delete(testInvitations)
          .where(eq(testInvitations.id, id))
          .run();
      }),
      acceptInvitation: vi
        .fn()
        .mockImplementation(async (db, token, userId) => {
          const invitation = await db
            .select()
            .from(testInvitations)
            .where(eq(testInvitations.token, token))
            .get();
          if (!invitation) return false;

          await db
            .insert(testMemberships)
            .values({
              id: crypto.randomUUID(),
              workspaceId: invitation.workspaceId,
              userId,
              role: invitation.role,
            })
            .run();

          await db
            .delete(testInvitations)
            .where(eq(testInvitations.id, invitation.id))
            .run();
          return true;
        }),
      getWorkspaceInvitations: vi
        .fn()
        .mockImplementation(async (db, workspaceId) => {
          return db
            .select()
            .from(testInvitations)
            .where(eq(testInvitations.workspaceId, workspaceId))
            .all();
        }),
    },
  };
});

describe("InvitationService", () => {
  let db: any;
  let service: any;
  let mockEmail: any;
  const workspaceId = "ws-123";

  beforeEach(async () => {
    db = createTestDb();
    mockEmail = {
      sendTeamInviteEmail: vi.fn().mockResolvedValue(undefined),
    };
    service = createInvitationService(db, mockEmail, "https://app.test");
    await db
      .insert(testWorkspaces)
      .values({ id: workspaceId, name: "Test WS", slug: "test" })
      .run();
  });

  afterEach(() => {
    closeTestDb();
  });

  it("should create an invitation and send an email", async () => {
    const inviterId = "u-1";
    await db
      .insert(testUsers)
      .values({ id: inviterId, email: "admin@test.com" })
      .run();

    const input = { email: "newuser@test.com", role: "member" };
    const result = await service.createInvitation(
      inviterId,
      "admin@test.com",
      workspaceId,
      "Test WS",
      input,
    );

    expect(result.email).toBe(input.email);
    expect(result.token).toBeDefined();
    expect(mockEmail.sendTeamInviteEmail).toHaveBeenCalledOnce();
  });

  it("should accept a valid invitation and create membership", async () => {
    const token = "secure-token";
    const inviterId = "admin-1";
    const inviteeId = "user-2";

    // Seed users
    await db
      .insert(testUsers)
      .values([
        { id: inviterId, email: "admin@test.com" },
        { id: inviteeId, email: "invitee@test.com" },
      ])
      .run();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await db
      .insert(testInvitations)
      .values({
        id: "inv-1",
        workspaceId,
        email: "invitee@test.com",
        role: "member",
        token,
        expiresAt: expiresAt.toISOString(),
        invitedBy: inviterId,
        status: "pending",
      })
      .run();

    const success = await service.acceptInvitation(inviteeId, { token });
    expect(success).toBe(true);

    const memberships = await db.select().from(testMemberships).all();
    expect(memberships).toHaveLength(1);
  });

  it("should throw error if token is invalid", async () => {
    await expect(
      service.acceptInvitation("user-2", { token: "wrong" }),
    ).rejects.toThrow("Invalid or expired invitation token");
  });

  it("should throw error and delete if invitation is expired", async () => {
    const token = "expired-token";
    const inviterId = "admin-1";
    await db
      .insert(testUsers)
      .values({ id: inviterId, email: "admin@test.com" })
      .run();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() - 1);

    await db
      .insert(testInvitations)
      .values({
        id: "inv-exp",
        workspaceId,
        email: "user@test.com",
        role: "member",
        token,
        expiresAt: expiresAt.toISOString(),
        invitedBy: inviterId,
        status: "pending",
      })
      .run();

    await expect(service.acceptInvitation("user-2", { token })).rejects.toThrow(
      "Invitation has expired",
    );
  });
});
