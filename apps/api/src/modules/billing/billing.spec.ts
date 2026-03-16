import { describe, it, expect, vi, beforeEach } from "vitest";
import { billingRouter } from "./billing.routes";
import { BillingController } from "./billing.controller";

// Mock dependencies
vi.mock("./billing.controller", () => ({
  BillingController: {
    createCheckout: vi.fn(),
    handleWebhook: vi.fn(),
    getSubscriptionStatus: vi.fn(),
    getCustomerPortal: vi.fn(),
  },
}));

// Mock middlewares
vi.mock("../../common/middlewares/authGuard", () => ({
  authGuard: async (c: any, next: any) => {
    c.set("userId", "user-123");
    c.set("user", { id: "user-123", email: "test@example.com" });
    return await next();
  },
}));

vi.mock("../../common/middlewares/workspaceGuard", () => ({
  workspaceGuard: async (c: any, next: any) => {
    c.set("workspaceId", "ws-123");
    return await next();
  },
}));

vi.mock("../../common/middlewares/permissionGuard", () => ({
  requirePermission: () => async (c: any, next: any) => {
    return await next();
  },
}));

// Mock rate limiter
vi.mock("../../common/middlewares/rateLimiter", () => ({
  rateLimit: () => async (c: any, next: any) => {
    return await next();
  },
}));

describe("Billing Endpoints Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /checkout should call controller's createCheckout", async () => {
    (BillingController.createCheckout as any).mockImplementation((c: any) =>
      c.json({ success: true }),
    );

    const res = await billingRouter.request("/checkout", {
      method: "POST",
      body: JSON.stringify({
        productId: "p1",
        workspaceId: "550e8400-e29b-41d4-a716-446655440000",
        redirectUrl: "https://ok.com",
      }),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(200);
    expect(BillingController.createCheckout).toHaveBeenCalled();
  });

  it("GET /subscription should call controller's getSubscriptionStatus", async () => {
    (BillingController.getSubscriptionStatus as any).mockImplementation(
      (c: any) => c.json({ status: "active" }),
    );

    const res = await billingRouter.request("/subscription", {
      method: "GET",
    });

    expect(res.status).toBe(200);
    expect(BillingController.getSubscriptionStatus).toHaveBeenCalled();
  });

  it("POST /portal should call controller's getCustomerPortal", async () => {
    (BillingController.getCustomerPortal as any).mockImplementation((c: any) =>
      c.json({ url: "https://portal" }),
    );

    const res = await billingRouter.request("/portal", {
      method: "POST",
    });

    expect(res.status).toBe(200);
    expect(BillingController.getCustomerPortal).toHaveBeenCalled();
  });

  it("POST /webhook should call controller's handleWebhook", async () => {
    (BillingController.handleWebhook as any).mockImplementation((c: any) =>
      c.json({ received: true }),
    );

    const res = await billingRouter.request("/webhook", {
      method: "POST",
      body: JSON.stringify({ event: "order" }),
    });

    expect(res.status).toBe(200);
    expect(BillingController.handleWebhook).toHaveBeenCalled();
  });
});
