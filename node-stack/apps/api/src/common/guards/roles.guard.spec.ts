import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@node-stack/types";
import { Mocked } from "vitest";

import { RolesGuard } from "@/common/guards/roles.guard.js";
import { mockExecutionContext } from "@/common/guards/test-helpers/mock-context.js";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it("allows access when no roles required", () => {
    (reflector.getAllAndOverride as any).mockReturnValue(undefined);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows access when user role meets minimum", () => {
    (reflector.getAllAndOverride as any).mockReturnValue([Role.MEMBER]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.ADMIN } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("denies access when user role is below minimum", () => {
    (reflector.getAllAndOverride as any).mockReturnValue([Role.ADMIN]);
    const ctx = mockExecutionContext({ user: { workspaceRole: Role.VIEWER } });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("denies access when user has no workspaceRole", () => {
    (reflector.getAllAndOverride as any).mockReturnValue([Role.MEMBER]);
    const ctx = mockExecutionContext({ user: {} });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

