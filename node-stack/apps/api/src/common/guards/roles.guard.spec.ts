import { Reflector } from "@nestjs/core";
import { ForbiddenException } from "@nestjs/common";
import { Role } from "@node-stack/types";

import { RolesGuard } from "./roles.guard.js";
import { mockExecutionContext } from "./test-helpers/mock-context.js";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it("allows access when no roles required", () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows access when user role meets minimum", () => {
    reflector.getAllAndOverride.mockReturnValue([Role.MEMBER]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.ADMIN } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("denies access when user role is below minimum", () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("denies access when user has no workspaceRole", () => {
    reflector.getAllAndOverride.mockReturnValue([Role.MEMBER]);
    const ctx = mockExecutionContext({ user: {} });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
