import { Reflector } from "@nestjs/core";
import { ForbiddenException } from "@nestjs/common";
import { Role, Permission } from "@node-stack/types";

import { PermissionsGuard } from "@/common/guards/permissions.guard.js";
import { mockExecutionContext } from "@/common/guards/test-helpers/mock-context.js";
import { Mocked } from "vitest";

describe("PermissionsGuard", () => {
  let guard: PermissionsGuard;
  let reflector: Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() } as any;
    guard = new PermissionsGuard(reflector);
  });

  it("allows access when no permissions required", () => {
    (reflector.getAllAndOverride as any).mockReturnValue(undefined);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows access when user has all required permissions", () => {
    (reflector.getAllAndOverride as any).mockReturnValue([Permission.WORKSPACE_READ]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.ADMIN } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("denies access when user missing one required permission", () => {
    (reflector.getAllAndOverride as any).mockReturnValue([Permission.BILLING_WRITE]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("SUPER_ADMIN role has all permissions", () => {
    (reflector.getAllAndOverride as any).mockReturnValue([Permission.WORKSPACE_DELETE]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.SUPER_ADMIN } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("VIEWER role only has read permissions (denies write)", () => {
    (reflector.getAllAndOverride as any).mockReturnValue([Permission.WORKSPACE_WRITE]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

