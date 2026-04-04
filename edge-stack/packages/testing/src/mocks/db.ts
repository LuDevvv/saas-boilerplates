import { vi } from "vitest";

export interface MockUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  role: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorRecoveryCodes: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockWorkspace {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockMembership {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  createdAt: Date;
}

const users = new Map<string, MockUser>();
const workspaces = new Map<string, MockWorkspace>();
const memberships = new Map<string, MockMembership>();

export const resetDb = () => {
  users.clear();
  workspaces.clear();
  memberships.clear();
};

export const createMockDb = () => {
  return {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation((table: any) => {
        const tableName = table?.name || "unknown";
        return {
          where: vi.fn().mockImplementation((condition: any) => {
            if (tableName === "users") {
              const allUsers = Array.from(users.values());
              return Promise.resolve(allUsers);
            }
            if (tableName === "workspaces") {
              const allWorkspaces = Array.from(workspaces.values());
              return Promise.resolve(allWorkspaces);
            }
            if (tableName === "memberships") {
              const allMemberships = Array.from(memberships.values());
              return Promise.resolve(allMemberships);
            }
            return Promise.resolve([]);
          }),
          innerJoin: vi.fn().mockResolvedValue([]),
        };
      }),
    })),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockImplementation((values: any) => {
        return {
          returning: vi.fn().mockImplementation(() => {
            if (values.email) {
              const id = `user-${Date.now()}`;
              const user: MockUser = {
                id,
                email: values.email,
                name: values.name || null,
                passwordHash: values.passwordHash || null,
                role: values.role || "user",
                emailVerified: values.emailVerified || false,
                avatarUrl: values.avatarUrl || null,
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorRecoveryCodes: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              users.set(id, user);
              return Promise.resolve([user]);
            }
            if (values.name) {
              const id = `workspace-${Date.now()}`;
              const workspace: MockWorkspace = {
                id,
                name: values.name,
                slug:
                  values.slug || values.name.toLowerCase().replace(/\s+/g, "-"),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              workspaces.set(id, workspace);
              return Promise.resolve([workspace]);
            }
            return Promise.resolve([]);
          }),
        };
      }),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation((values: any) => ({
        where: vi.fn().mockImplementation((condition: any) => {
          return Promise.resolve([]);
        }),
      })),
    })),
    delete: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockImplementation((condition: any) => {
        return Promise.resolve([]);
      }),
    })),
  };
};

export const mockUserRepository = {
  findByEmail: vi.fn().mockImplementation((db: any, email: string) => {
    const user = Array.from(users.values()).find((u) => u.email === email);
    return Promise.resolve(user || null);
  }),
  findById: vi.fn().mockImplementation((db: any, id: string) => {
    const user = users.get(id);
    return Promise.resolve(user || null);
  }),
  create: vi.fn().mockImplementation((db: any, data: Partial<MockUser>) => {
    const id = data.id || `user-${Date.now()}`;
    const user: MockUser = {
      id,
      email: data.email!,
      name: data.name || null,
      passwordHash: data.passwordHash || null,
      role: data.role || "user",
      emailVerified: data.emailVerified || false,
      avatarUrl: data.avatarUrl || null,
      twoFactorEnabled: data.twoFactorEnabled || false,
      twoFactorSecret: data.twoFactorSecret || null,
      twoFactorRecoveryCodes: data.twoFactorRecoveryCodes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(id, user);
    return Promise.resolve(user);
  }),
};

export const mockWorkspaceRepository = {
  findById: vi.fn().mockImplementation((db: any, id: string) => {
    const workspace = workspaces.get(id);
    return Promise.resolve(workspace || null);
  }),
  findBySlug: vi.fn().mockImplementation((db: any, slug: string) => {
    const workspace = Array.from(workspaces.values()).find(
      (w) => w.slug === slug,
    );
    return Promise.resolve(workspace || null);
  }),
  create: vi
    .fn()
    .mockImplementation((db: any, data: Partial<MockWorkspace>) => {
      const id = data.id || `workspace-${Date.now()}`;
      const workspace: MockWorkspace = {
        id,
        name: data.name!,
        slug: data.slug || data.name!.toLowerCase().replace(/\s+/g, "-"),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      workspaces.set(id, workspace);
      return Promise.resolve(workspace);
    }),
};

export const seedTestData = () => {
  const testUser: MockUser = {
    id: "test-user-1",
    email: "test@example.com",
    name: "Test User",
    passwordHash: "hashed_password",
    role: "user",
    emailVerified: true,
    avatarUrl: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorRecoveryCodes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.set(testUser.id, testUser);

  const testWorkspace: MockWorkspace = {
    id: "test-workspace-1",
    name: "Test Workspace",
    slug: "test-workspace",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  workspaces.set(testWorkspace.id, testWorkspace);

  const testMembership: MockMembership = {
    id: "test-membership-1",
    userId: testUser.id,
    workspaceId: testWorkspace.id,
    role: "owner",
    createdAt: new Date(),
  };
  memberships.set(testMembership.id, testMembership);
};
