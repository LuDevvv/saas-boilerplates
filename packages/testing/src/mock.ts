import { vi } from "vitest";

export const createMockRequest = (
  overrides: RequestInit & { url?: string } = {},
) => {
  const defaultUrl = "http://localhost:3000";
  return new Request(overrides.url ?? defaultUrl, {
    method: "GET",
    headers: new Headers(overrides.headers as Record<string, string>),
    ...overrides,
  });
};

export const createMockResponse = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
};

export const mockService = <T extends (...args: unknown[]) => unknown>(
  implementation: T,
): ReturnType<typeof vi.fn> => {
  return vi.fn(implementation) as ReturnType<typeof vi.fn>;
};

export const createMockDb = () => ({
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  }),
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  }),
  delete: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue([]),
  }),
});

export const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
  emailVerified: true,
  passwordHash: "hashed_password",
  avatarUrl: null,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  twoFactorRecoveryCodes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockWorkspace = {
  id: "workspace-123",
  name: "Test Workspace",
  slug: "test-workspace",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockToken = (payload: Record<string, unknown> = {}) => {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = "mock-signature";
  return `${header}.${body}.${signature}`;
};
