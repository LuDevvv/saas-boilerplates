import { ForbiddenException, ExecutionContext } from "@nestjs/common";
import { vi } from "vitest";

vi.mock("@node-stack/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@node-stack/db")>();
  return {
    ...actual,
    withTenantTx: vi.fn(async (_workspaceId: string, cb: (tx: unknown) => unknown) => cb({})),
  };
});

import { PLAN_LIMITS, DEFAULT_PLAN } from "@/common/config/plans.config.js";
import { BillingGuard } from "@/common/guards/billing.guard.js";

describe("BillingGuard", () => {
  let guard: BillingGuard;
  let billingRepo: any;
  let aiRepo: any;

  beforeEach(() => {
    billingRepo = {
      findSubscriptionByWorkspaceId: vi.fn(),
    };
    aiRepo = {
      getMonthlyUsage: vi.fn(),
    };
    guard = new BillingGuard(billingRepo, aiRepo, {} as any);
  });

  it("should allow access if usage is within limits", async () => {
    const workspaceId = "ws-123";
    const context = createMockContext(workspaceId);

    billingRepo.findSubscriptionByWorkspaceId.mockResolvedValue({
      planId: "free",
      status: "active",
    });

    aiRepo.getMonthlyUsage.mockResolvedValue(5000); // 5k < 10k limit

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it("should throw ForbiddenException if usage exceeds limits", async () => {
    const workspaceId = "ws-123";
    const context = createMockContext(workspaceId);

    billingRepo.findSubscriptionByWorkspaceId.mockResolvedValue({
      planId: "free",
      status: "active",
    });

    aiRepo.getMonthlyUsage.mockResolvedValue(15000); // 15k > 10k limit

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow(/AI usage limit reached/);
  });

  it("should allow access if no workspace context is found", async () => {
    const context = createMockContext(null);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  function createMockContext(workspaceId: string | null): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          workspace: workspaceId ? { id: workspaceId } : null,
          params: {},
        }),
      }),
    } as any;
  }
});
