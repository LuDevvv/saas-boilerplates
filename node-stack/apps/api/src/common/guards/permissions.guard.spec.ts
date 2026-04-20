import { Reflector } from "@nestjs/core";
import { ForbiddenException } from "@nestjs/common";
import { Role, Permission } from "@node-stack/types";

import { PermissionsGuard } from "./permissions.guard";
import { mockExecutionContext } from "./test-helpers/mock-context";

describe("PermissionsGuard", () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new PermissionsGuard(reflector);
  });

  it("allows access when no permissions required", () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows access when user has all required permissions", () => {
    // Corrected Permission names based on @node-stack/types
    reflector.getAllAndOverride.mockReturnValue([Permission.WORKSPACE_READ]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.ADMIN } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("denies access when user missing one required permission", () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.BILLING_WRITE]);
    // VIEWER only has WORKSPACE_READ
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("SUPER_ADMIN role has all permissions", () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.WORKSPACE_DELETE]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.SUPER_ADMIN } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("VIEWER role only has read permissions (denies write)", () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.WORKSPACE_WRITE]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
