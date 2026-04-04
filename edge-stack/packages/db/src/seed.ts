import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import { permissions, rolePermissions } from "./schema/permissions";
import { users } from "./schema/users";
import { workspaces, memberships } from "./schema/workspaces";
import { auditLogs } from "./schema/audit";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../.env") });

const TEST_PASSWORD_HASH =
  "fb48ce6e88c2a0cdfcf3297b71702ab3.c53a0dfc769a2ab1e7d04946d0966f41e6ca912984850c8984c6caef6a029d2a";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in packages/db/.env");
}

async function seed() {
  console.log("🌱 Seeding database with realistic data...");

  const sql = neon(connectionString!);
  const db = drizzle(sql);

  // 1. Roles & Permissions (Core RBAC)
  const allPermissions = [
    {
      id: "workspace.update",
      name: "Update Workspace",
      description: "Can change workspace settings and name",
    },
    {
      id: "workspace.members.read",
      name: "Read Members",
      description: "Can view workspace members and invitations",
    },
    {
      id: "workspace.members.create",
      name: "Invite Members",
      description: "Can invite new members to the workspace",
    },
    {
      id: "workspace.members.update",
      name: "Update Member Roles",
      description: "Can change roles of other members",
    },
    {
      id: "workspace.members.delete",
      name: "Remove Members",
      description: "Can remove members from the workspace",
    },
    {
      id: "workspace.audit.read",
      name: "Read Audit Logs",
      description: "Can view workspace activity logs",
    },
    {
      id: "billing.manage",
      name: "Manage Billing",
      description: "Can view and change subscription plans",
    },
    {
      id: "billing.read",
      name: "Read Invoices",
      description: "Can view billing history and invoices",
    },
  ];

  for (const p of allPermissions) {
    await db
      .insert(permissions)
      .values(p)
      .onConflictDoUpdate({
        target: permissions.id,
        set: { name: p.name, description: p.description },
      });
  }

  const assignments = [
    // Owner (God mode)
    { role: "owner", permissionId: "workspace.update" },
    { role: "owner", permissionId: "workspace.members.read" },
    { role: "owner", permissionId: "workspace.members.create" },
    { role: "owner", permissionId: "workspace.members.update" },
    { role: "owner", permissionId: "workspace.members.delete" },
    { role: "owner", permissionId: "workspace.audit.read" },
    { role: "owner", permissionId: "billing.manage" },
    { role: "owner", permissionId: "billing.read" },

    // Admin (Management mode)
    { role: "admin", permissionId: "workspace.update" },
    { role: "admin", permissionId: "workspace.members.read" },
    { role: "admin", permissionId: "workspace.members.create" },
    { role: "admin", permissionId: "workspace.members.update" },
    { role: "admin", permissionId: "billing.manage" },
    { role: "admin", permissionId: "billing.read" },

    // Member (Limited view access)
    { role: "member", permissionId: "workspace.members.read" },
  ];

  for (const a of assignments) {
    await db
      .insert(rolePermissions)
      .values(a as any)
      .onConflictDoNothing();
  }

  // 2. Sample Users
  console.log("Synchronizing users...");
  const sampleUsers = [
    {
      email: "owner@acme.com",
      name: "Alice Owner",
      passwordHash: TEST_PASSWORD_HASH,
      emailVerified: true,
    },
    {
      email: "admin@acme.com",
      name: "Bob Admin",
      passwordHash: TEST_PASSWORD_HASH,
      emailVerified: true,
    },
    {
      email: "member@acme.com",
      name: "Charlie Member",
      passwordHash: TEST_PASSWORD_HASH,
      emailVerified: true,
    },
    {
      email: "freelancer@test.com",
      name: "Dev Dave",
      passwordHash: TEST_PASSWORD_HASH,
      emailVerified: true,
    },
  ];

  const userMap: Record<string, string> = {};
  for (const u of sampleUsers) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, u.email))
      .limit(1);
    if (existing[0]) {
      await db
        .update(users)
        .set({
          name: u.name,
          passwordHash: u.passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing[0].id));
      userMap[u.email] = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          ...u,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      userMap[u.email] = inserted.id;
    }
  }

  // 3. Sample Workspaces
  console.log("Synchronizing workspaces...");
  const sampleWorkspaces = [
    {
      name: "Acme Corp",
      slug: "acme-corp",
      logoUrl: "https://placehold.co/400x400?text=ACME",
    },
    {
      name: "Freelance Studio",
      slug: "dave-studio",
      logoUrl: "https://placehold.co/400x400?text=Dave",
    },
  ];

  const workspaceMap: Record<string, string> = {};
  for (const w of sampleWorkspaces) {
    const existing = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, w.slug))
      .limit(1);
    if (existing[0]) {
      await db
        .update(workspaces)
        .set({
          name: w.name,
          logoUrl: w.logoUrl,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, existing[0].id));
      workspaceMap[w.slug] = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(workspaces)
        .values({
          ...w,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      workspaceMap[w.slug] = inserted.id;
    }
  }

  // 4. Memberships
  console.log("Synchronizing memberships...");
  const membershipAssignments = [
    { email: "owner@acme.com", slug: "acme-corp", role: "owner" as const },
    { email: "admin@acme.com", slug: "acme-corp", role: "admin" as const },
    { email: "member@acme.com", slug: "acme-corp", role: "member" as const },
    {
      email: "freelancer@test.com",
      slug: "dave-studio",
      role: "owner" as const,
    },
  ];

  for (const m of membershipAssignments) {
    const userId = userMap[m.email];
    const workspaceId = workspaceMap[m.slug];

    const existing = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(memberships)
        .set({ role: m.role })
        .where(
          and(
            eq(memberships.userId, userId),
            eq(memberships.workspaceId, workspaceId),
          ),
        );
    } else {
      await db.insert(memberships).values({
        userId,
        workspaceId,
        role: m.role,
        createdAt: new Date(),
      });
    }
  }

  // 5. Audit Logs
  console.log("Adding activity logs...");
  const acmeId = workspaceMap["acme-corp"];
  const ownerId = userMap["owner@acme.com"];
  const adminId = userMap["admin@acme.com"];

  await db.insert(auditLogs).values([
    {
      workspaceId: acmeId,
      userId: ownerId,
      action: "workspace.create",
      entityType: "workspace",
      entityId: acmeId,
      ipAddress: "127.0.0.1",
      createdAt: new Date(),
    },
    {
      workspaceId: acmeId,
      userId: ownerId,
      action: "workspace.members.create",
      entityType: "user",
      entityId: adminId,
      metadata: { targetEmail: "admin@acme.com" },
      createdAt: new Date(),
    },
  ]);

  console.log("✅ Seeding completed successfully!");
  console.log("\nTest Credentials:");
  console.log("- Password for ALL users: Password123!");
  console.log(
    "- Users: owner@acme.com, admin@acme.com, member@acme.com, freelancer@test.com",
  );
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
