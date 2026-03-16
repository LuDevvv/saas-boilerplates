import { describe, it, expect, vi, beforeEach } from "vitest";
import { workspaceGuard } from "./workspaceGuard";
import { WorkspaceRepository, PermissionRepository } from "@workspace/db";
import { createCacheService } from "../services/cache.service";

// Mock modules
vi.mock("@workspace/db");
vi.mock("../services/cache.service");

describe("workspaceGuard Middleware", () => {
  let mockContext: any;
  let mockNext: any;
  let mockCache: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockNext = vi.fn().mockResolvedValue(undefined);

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
    };
    vi.mocked(createCacheService).mockReturnValue(mockCache);

    mockContext = {
      req: {
        header: vi.fn((name: string) => {
          if (name === "x-workspace-id") return "ws-123";
          return null;
        }),
      },
      get: vi.fn((key: string) => {
        if (key === "userId") return "user-123";
        return null;
      }),
      set: vi.fn(),
      env: {
        DATABASE_URL: "mock-db-url",
        CACHE_KV: {},
      },
    } as any;
  });

  it("should allow access and set context on cache hit", async () => {
    mockCache.get.mockResolvedValue({
      role: "owner",
      permissions: ["*"],
    });

    await workspaceGuard(mockContext, mockNext);

    expect(mockContext.set).toHaveBeenCalledWith("workspaceId", "ws-123");
    expect(mockContext.set).toHaveBeenCalledWith("workspaceRole", "owner");
    expect(mockContext.set).toHaveBeenCalledWith("permissions", ["*"]);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should fetch from DB and populate cache on cache miss", async () => {
    mockCache.get.mockResolvedValue(null);
    vi.mocked(WorkspaceRepository.getMembership).mockResolvedValue({
      role: "member",
    } as any);
    vi.mocked(PermissionRepository.getEffectivePermissions).mockResolvedValue([
      "read",
    ]);

    await workspaceGuard(mockContext, mockNext);

    expect(WorkspaceRepository.getMembership).toHaveBeenCalled();
    expect(PermissionRepository.getEffectivePermissions).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("should throw 400 if x-workspace-id header is missing", async () => {
    mockContext.req.header = vi.fn(() => null);

    await expect(workspaceGuard(mockContext, mockNext)).rejects.toThrow(
      /Missing 'x-workspace-id' header/,
    );
  });

  it("should throw 403 if user is not a member of the workspace", async () => {
    mockCache.get.mockResolvedValue(null);
    vi.mocked(WorkspaceRepository.getMembership).mockResolvedValue(null);

    await expect(workspaceGuard(mockContext, mockNext)).rejects.toThrow(
      /You do not have permission to access this workspace/,
    );
  });
});
