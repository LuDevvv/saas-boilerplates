import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createBillingService } from "./billing.service";
import {
  createTestDb,
  closeTestDb,
  testWorkspaces,
  testSubscriptions,
  testCustomers,
} from "@workspace/testing";
import { SubscriptionRepository } from "@workspace/db";

// Redireccionamos los esquemas de Postgres a las tablas de SQLite de prueba
vi.mock("@workspace/db", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  const { testSubscriptions, testCustomers } =
    await import("@workspace/testing");
  const { eq, and } = await import("drizzle-orm");

  return {
    ...actual,
    SubscriptionRepository: {
      ...actual.SubscriptionRepository,
      upsertCustomer: vi.fn().mockImplementation(async (db, data) => {
        const existing = await db
          .select()
          .from(testCustomers)
          .where(eq(testCustomers.workspaceId, data.workspaceId))
          .get();
        if (existing) {
          return db
            .update(testCustomers)
            .set(data)
            .where(eq(testCustomers.workspaceId, data.workspaceId))
            .run();
        }
        return db
          .insert(testCustomers)
          .values({ id: crypto.randomUUID(), ...data })
          .run();
      }),
      upsertSubscription: vi.fn().mockImplementation(async (db, data) => {
        // Convert Dates to strings for SQLite
        const sqliteData = {
          ...data,
          nextPaymentAt:
            data.nextPaymentAt instanceof Date
              ? data.nextPaymentAt.toISOString()
              : data.nextPaymentAt,
          endsAt:
            data.endsAt instanceof Date
              ? data.endsAt.toISOString()
              : data.endsAt,
        };
        const existing = await db
          .select()
          .from(testSubscriptions)
          .where(
            eq(
              testSubscriptions.providerSubscriptionId,
              data.providerSubscriptionId,
            ),
          )
          .get();
        if (existing) {
          return db
            .update(testSubscriptions)
            .set(sqliteData)
            .where(
              eq(
                testSubscriptions.providerSubscriptionId,
                data.providerSubscriptionId,
              ),
            )
            .run();
        }
        return db
          .insert(testSubscriptions)
          .values({ id: crypto.randomUUID(), ...sqliteData })
          .run();
      }),
      getActiveSubscription: vi
        .fn()
        .mockImplementation(async (db, workspaceId) => {
          return db
            .select()
            .from(testSubscriptions)
            .where(
              and(
                eq(testSubscriptions.workspaceId, workspaceId),
                eq(testSubscriptions.status, "active"),
              ),
            )
            .get();
        }),
      getSubscriptionByWorkspace: vi
        .fn()
        .mockImplementation(async (db, workspaceId) => {
          return db
            .select()
            .from(testSubscriptions)
            .where(eq(testSubscriptions.workspaceId, workspaceId))
            .all();
        }),
      getCustomerByWorkspace: vi
        .fn()
        .mockImplementation(async (db, workspaceId) => {
          return db
            .select()
            .from(testCustomers)
            .where(eq(testCustomers.workspaceId, workspaceId))
            .get();
        }),
    },
  };
});

describe("BillingService", () => {
  let db: any;
  let service: any;
  const workspaceId = "ws-123";

  beforeEach(async () => {
    db = createTestDb();
    service = createBillingService(db);
    await db
      .insert(testWorkspaces)
      .values({ id: workspaceId, name: "Test WS", slug: "test" });
  });

  afterEach(() => {
    closeTestDb();
  });

  it("should sync subscription successfully (upsert customer and sub)", async () => {
    const data = {
      workspaceId,
      userId: "user-1",
      providerSubscriptionId: "sub_external_123",
      providerCustomerId: "cus_external_123",
      planId: "pro-plan",
      variantId: "v-1",
      status: "active" as any,
      nextPaymentAt: new Date(),
      endsAt: null,
    };

    const result = await service.syncSubscription(data);
    expect(result.success).toBe(true);
    expect(SubscriptionRepository.upsertCustomer).toHaveBeenCalled();
    expect(SubscriptionRepository.upsertSubscription).toHaveBeenCalled();
  });

  it("should return correct status when active subscription exists", async () => {
    await db.insert(testSubscriptions).values({
      id: "sub-1",
      workspaceId,
      providerSubscriptionId: "ext-1",
      planId: "pro",
      variantId: "v-1",
      status: "active",
    });

    const status = await service.getSubscriptionStatus(workspaceId);
    expect(status.hasActiveSubscription).toBe(true);
    expect(status.subscription?.planId).toBe("pro");
  });

  it("should return false status when no subscription exists", async () => {
    const status = await service.getSubscriptionStatus(workspaceId);
    expect(status.hasActiveSubscription).toBe(false);
    expect(status.subscription).toBeNull();
  });

  it("should generate portal URL using provider when customer exists", async () => {
    await db.insert(testCustomers).values({
      id: "cus-1",
      workspaceId,
      providerCustomerId: "cus_ext_123",
    });
    await db.insert(testSubscriptions).values({
      id: "sub-1",
      workspaceId,
      providerSubscriptionId: "ext-1",
      planId: "pro",
      variantId: "v-1",
      status: "active",
    });

    const mockProvider = {
      getCustomerPortalUrl: vi
        .fn()
        .mockResolvedValue({ url: "https://billing.portal" }),
    };

    const result = await service.getCustomerPortalUrl(
      workspaceId,
      mockProvider as any,
    );
    expect(result.url).toBe("https://billing.portal");
    expect(mockProvider.getCustomerPortalUrl).toHaveBeenCalledWith({
      providerCustomerId: "cus_ext_123",
    });
  });

  it("should throw error when generating portal URL if no subscription exists", async () => {
    const mockProvider = { getCustomerPortalUrl: vi.fn() };
    await expect(
      service.getCustomerPortalUrl(workspaceId, mockProvider as any),
    ).rejects.toThrow("No subscription found");
  });
});
