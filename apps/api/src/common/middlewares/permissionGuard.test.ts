import { describe, it, expect, vi, beforeEach } from "vitest";
import { requirePermission } from "./permissionGuard";
import { AppError } from "@workspace/types";

describe("permissionGuard Middleware", () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    mockNext = vi.fn().mockResolvedValue(undefined);
    mockContext = {
      get: vi.fn((key: string) => {
        if (key === "workspaceId") return "ws-123";
        if (key === "permissions") return ["task:read", "task:write"];
        return null;
      }),
      set: vi.fn(),
    } as any;
  });

  it("should allow access if user has the required permission", async () => {
    const middleware = requirePermission("task:read");
    await middleware(mockContext, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should throw FORBIDDEN if user lacks the required permission", async () => {
    const middleware = requirePermission("admin:all");
    await expect(middleware(mockContext, mockNext)).rejects.toThrow(
      new AppError(
        "Unauthorized. Missing required permission: admin:all",
        403,
        "FORBIDDEN",
      ),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should throw MISSING_WORKSPACE_CONTEXT if workspace context is missing", async () => {
    mockContext.get = vi.fn(() => null);
    const middleware = requirePermission("task:read");
    await expect(middleware(mockContext, mockNext)).rejects.toThrow(
      /Access context missing/,
    );
  });
});
