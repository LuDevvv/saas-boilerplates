import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createTestDb,
  closeTestDb,
  testWorkspaces,
  testTasks,
  testUsageMetrics,
  testSubscriptions,
  testMemberships,
  testUsers,
} from "@workspace/testing";
import { MetricsRepository } from "./metrics.repository";

// Redireccionamos los esquemas de Postgres a las tablas de SQLite de prueba
vi.mock("../schema/workspaces", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    memberships: testMemberships,
    workspaces: testWorkspaces,
  };
});
vi.mock("../schema/tasks", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return { ...actual, tasks: testTasks };
});
vi.mock("../schema/usage", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return { ...actual, usageMetrics: testUsageMetrics };
});
vi.mock("../schema/billing", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return { ...actual, subscriptions: testSubscriptions };
});

describe("MetricsRepository", () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    closeTestDb();
  });

  it("should return zeros for a workspace with no data", async () => {
    const workspaceId = "ws-1";

    await db.insert(testWorkspaces).values({
      id: workspaceId,
      name: "Test Workspace",
      slug: "test-ws",
    });

    const metrics = await MetricsRepository.getDashboardMetrics(
      db,
      workspaceId,
    );

    expect(metrics).toEqual({
      teamMembers: 0,
      totalTasks: 0,
      subscriptionStatus: null,
      usage: [],
    });
  });

  it("should aggregate all metrics correctly for a workspace with data", async () => {
    const workspaceId = "ws-1";
    const userId = "user-1";

    // Seed data
    await db
      .insert(testUsers)
      .values({ id: userId, email: "test@example.com" });
    await db
      .insert(testWorkspaces)
      .values({ id: workspaceId, name: "Test WS", slug: "test-ws" });

    await db.insert(testMemberships).values([
      { id: "m-1", userId, workspaceId, role: "owner" },
      { id: "m-2", userId, workspaceId, role: "member" },
    ]);

    await db.insert(testTasks).values([
      { id: "t-1", workspaceId, title: "Task 1" },
      { id: "t-2", workspaceId, title: "Task 2" },
      { id: "t-3", workspaceId, title: "Task 3" },
    ]);

    await db.insert(testSubscriptions).values({
      id: "sub-1",
      workspaceId,
      providerSubscriptionId: "ext-sub-1",
      status: "active",
      planId: "pro",
      variantId: "v-1",
      nextPaymentAt: new Date().toISOString(),
    });

    await db.insert(testUsageMetrics).values([
      {
        workspaceId,
        metricName: "api_calls",
        currentUsage: 500,
        quotaLimit: 1000,
        resetAt: new Date().toISOString(),
      },
      {
        workspaceId,
        metricName: "storage_kb",
        currentUsage: 256,
        quotaLimit: 512,
        resetAt: new Date().toISOString(),
      },
    ]);

    const metrics = await MetricsRepository.getDashboardMetrics(
      db,
      workspaceId,
    );

    expect(metrics.teamMembers).toBe(2);
    expect(metrics.totalTasks).toBe(3);
    expect(metrics.subscriptionStatus).toBe("active");
    expect(metrics.usage).toHaveLength(2);

    const apiMetric = metrics.usage.find((u) => u.metricName === "api_calls");
    expect(apiMetric?.currentUsage).toBe(500);
    expect(apiMetric?.quotaLimit).toBe(1000);
  });
});
