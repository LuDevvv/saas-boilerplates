import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { CacheService } from "@node-stack/cache";
import { BillingRepository, AuditLogRepository, DB_TOKEN } from "@node-stack/db";
import { vi } from "vitest";

vi.mock("@node-stack/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@node-stack/db")>();
  return {
    ...actual,
    withTenantTx: vi.fn(async (_id: string, cb: (tx: unknown) => unknown) => cb({})),
    withSystemTx: vi.fn(async (cb: (tx: unknown) => unknown) => cb({})),
  };
});

import { BillingService } from "@/billing/billing.service.js";
import { EncryptionService } from "@/common/services/encryption.service.js";
import { OutboxService } from "@/common/services/outbox.service.js";


describe("BillingService", () => {
  let service: BillingService;
  let mockProvider: any;
  let mockBillingRepo: any;

  const mockConfigService = {
    get: vi.fn().mockImplementation((key: string, fallback?: string) => {
      const vals: Record<string, string> = {
        POLAR_WEBHOOK_SECRET: "secret",
        POLAR_ACCESS_TOKEN: "token",
      };
      return vals[key] ?? fallback ?? null;
    }),
    getOrThrow: vi.fn().mockReturnValue("token"),
  };

  const mockOutbox = {
    createEvent: vi.fn(),
    transaction: vi.fn((cb: (tx: any) => any) => cb({})),
  };

  const mockEncryption = {
    encrypt: vi.fn((v: string) => `enc_${v}`),
    decrypt: vi.fn((v: string) => v.replace("enc_", "")),
    isEnabled: true,
  };

  const mockCache = {
    getOrSet: vi.fn((_k, fn) => fn()),
    del: vi.fn(),
  };

  const mockEventEmitter = {
    emit: vi.fn(),
  };

  beforeEach(async () => {
    mockProvider = {
      createCheckoutSession: vi.fn(),
      handleWebhook: vi.fn(),
      createCustomer: vi.fn(),
      createSubscription: vi.fn(),
      cancelSubscription: vi.fn(),
      getSubscription: vi.fn(),
    };

    mockBillingRepo = {
      findCustomerByWorkspaceId: vi.fn().mockResolvedValue(null),
      findSubscriptionByWorkspaceId: vi.fn().mockResolvedValue(null),
      upsertCustomer: vi.fn(),
      upsertSubscription: vi.fn(),
      isEventProcessed: vi.fn().mockResolvedValue(false),
      markEventProcessed: vi.fn(),
      transaction: vi.fn((cb: (tx: any) => any) => cb({})),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: OutboxService, useValue: mockOutbox },
        { provide: BillingRepository, useValue: mockBillingRepo },
        { provide: AuditLogRepository, useValue: { create: vi.fn() } },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: CacheService, useValue: mockCache },
        { provide: "PAYMENT_PROVIDER", useValue: mockProvider },
        { provide: DB_TOKEN, useValue: {} },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    vi.clearAllMocks();
  });

  // ─── Checkout ───────────────────────────────────────────────────────

  describe("createCheckout", () => {
    it("calls payment provider and writes outbox event", async () => {
      (mockProvider.createCheckoutSession as any).mockResolvedValue({
        url: "https://checkout.test",
        expiresAt: new Date("2026-01-01"),
      });

      const result = await service.createCheckout({
        planId: "plan-1",
        successUrl: "https://success",
        cancelUrl: "https://cancel",
        workspaceId: "w1",
        userId: "u1",
      });

      expect(result.url).toBe("https://checkout.test");
      expect(mockProvider.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: "plan-1",
          metadata: { workspace_id: "w1", user_id: "u1" },
        }),
      );
      expect(mockOutbox.createEvent).toHaveBeenCalledWith(
        "checkout.created",
        expect.objectContaining({
          checkoutUrl: "https://checkout.test",
          workspaceId: "w1",
        }),
        expect.anything(),
      );
    });

    it("passes existing customer ID when customer exists in DB", async () => {
      (mockBillingRepo.findCustomerByWorkspaceId as any).mockResolvedValue({
        id: "cust-1",
        providerCustomerId: "enc_polar_cus_abc",
      });
      (mockProvider.createCheckoutSession as any).mockResolvedValue({
        url: "https://checkout.test",
        expiresAt: new Date("2026-01-01"),
      });

      await service.createCheckout({
        planId: "plan-1",
        successUrl: "https://success",
        cancelUrl: "https://cancel",
        workspaceId: "w1",
        userId: "u1",
      });

      expect(mockProvider.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "polar_cus_abc",
        }),
      );
    });
  });

  // ─── Webhook Handling ──────────────────────────────────────────────

  describe("handleWebhook", () => {
    it("throws UnauthorizedException on signature failure", async () => {
      (mockProvider.handleWebhook as any).mockRejectedValue(
        new Error("Webhook signature verification failed"),
      );

      await expect(
        service.handleWebhook('{"event":"test"}', { "webhook-signature": "invalid" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("skips duplicate events based on idempotency check", async () => {
      (mockProvider.handleWebhook as any).mockResolvedValue({
        id: "evt-1",
        type: "subscription.created",
        timestamp: new Date(),
        data: {},
        processed: true,
      });
      (mockBillingRepo.isEventProcessed as any).mockResolvedValue(true);

      const result = await service.handleWebhook(
        '{"type":"subscription.created"}',
        {},
      );

      expect(result.id).toBe("evt-1");
      expect(mockBillingRepo.upsertSubscription).not.toHaveBeenCalled();
    });

    it("processes subscription.created and writes to DB + outbox", async () => {
      (mockProvider.handleWebhook as any).mockResolvedValue({
        id: "evt-2",
        type: "subscription.created",
        timestamp: new Date(),
        data: {
          data: {
            id: "sub-polar-1",
            customerId: "cus-polar-1",
            productId: "prod-1",
            priceId: "price-1",
            status: "active",
            metadata: { workspace_id: "w1" },
          },
        },
        processed: true,
      });

      const result = await service.handleWebhook("{}", {});

      expect(result.type).toBe("subscription.created");
      expect(mockBillingRepo.upsertCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: "w1",
          providerCustomerId: "enc_cus-polar-1",
        }),
        expect.anything(),
      );
      expect(mockBillingRepo.upsertSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: "w1",
          providerSubscriptionId: "sub-polar-1",
          planId: "prod-1",
          status: "active",
        }),
        expect.anything(),
      );
      expect(mockBillingRepo.markEventProcessed).toHaveBeenCalledWith(
        { providerEventId: "evt-2", eventType: "subscription.created" },
        expect.anything(),
      );
    });
  });

  // ─── Read Operations ──────────────────────────────────────────────

  describe("getSubscription", () => {
    it('returns { status: "none" } when no subscription exists', async () => {
      const result = await service.getSubscription("w1");
      expect(result.status).toBe("none");
    });

    it("returns subscription data when one exists", async () => {
      (mockBillingRepo.findSubscriptionByWorkspaceId as any).mockResolvedValue({
        id: "sub-1",
        status: "active",
        planId: "plan-1",
        variantId: "var-1",
        currentPeriodStart: new Date("2026-01-01"),
        currentPeriodEnd: new Date("2026-02-01"),
        cancelAt: null,
        endsAt: null,
      });

      const result = await service.getSubscription("w1");
      expect(result.status).toBe("active");
      expect(result.planId).toBe("plan-1");
    });
  });
});

