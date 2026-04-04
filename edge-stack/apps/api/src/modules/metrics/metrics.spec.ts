import { describe, it, expect, vi, beforeEach } from "vitest";
import { metricsRouter } from "./metrics.routes";
import { MetricsRepository } from "@workspace/db";

// Mock @workspace/db
vi.mock("@workspace/db", () => ({
  MetricsRepository: {
    getDashboardMetrics: vi.fn(),
  },
  createDbClient: vi.fn(() => ({})),
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
    c.set("workspaceRole", "owner");
    return await next();
  },
}));

describe("Metrics Endpoints Integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("GET /dashboard should return aggregated metrics", async () => {
    const mockMetrics = {
      teamMembers: 5,
      totalTasks: 10,
      subscriptionStatus: "active",
      usage: [],
    };

    // En Vitest, si el mock se define en el módulo,
    // podemos acceder a la función mockeada así
    const mockFn = MetricsRepository.getDashboardMetrics as any;
    mockFn.mockResolvedValue(mockMetrics);

    const res = await metricsRouter.request(
      "/dashboard",
      {
        method: "GET",
      },
      {
        DATABASE_URL: "mock-url",
      } as any,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockMetrics);
  });
});
