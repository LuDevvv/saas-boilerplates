import { ForbiddenException, ExecutionContext } from "@nestjs/common";
import { BillingGuard } from "@/common/guards/billing.guard.js";
import { PLAN_LIMITS, DEFAULT_PLAN } from "@/common/config/plans.config.js";
import { Mocked } from "vitest";

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
    guard = new BillingGuard(billingRepo, aiRepo);
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

