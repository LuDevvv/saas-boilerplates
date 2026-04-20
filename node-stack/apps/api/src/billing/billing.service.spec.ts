import { Test, TestingModule } from "@nestjs/testing";
import { BillingService } from "./billing.service";
import { ConfigService } from "@nestjs/config";
import { OutboxService } from "../common/services/outbox.service";
import { EncryptionService } from "../common/services/encryption.service";
import { BillingRepository } from "@node-stack/db";
import { UnauthorizedException } from "@nestjs/common";

describe("BillingService", () => {
  let service: BillingService;
  let mockProvider: any;
  let mockBillingRepo: any;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, fallback?: string) => {
      const vals: Record<string, string> = {
        POLAR_WEBHOOK_SECRET: "secret",
        POLAR_ACCESS_TOKEN: "token",
      };
      return vals[key] ?? fallback ?? null;
    }),
    getOrThrow: jest.fn().mockReturnValue("token"),
  };

  const mockOutbox = {
    createEvent: jest.fn(),
    transaction: jest.fn((cb: (tx: any) => any) => cb({})),
  };

  const mockEncryption = {
    encrypt: jest.fn((v: string) => `enc_${v}`),
    decrypt: jest.fn((v: string) => v.replace("enc_", "")),
    isEnabled: true,
  };

  beforeEach(async () => {
    mockProvider = {
      createCheckoutSession: jest.fn(),
      handleWebhook: jest.fn(),
      createCustomer: jest.fn(),
      createSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      getSubscription: jest.fn(),
    };

    mockBillingRepo = {
      findCustomerByWorkspaceId: jest.fn().mockResolvedValue(null),
      findSubscriptionByWorkspaceId: jest.fn().mockResolvedValue(null),
      upsertCustomer: jest.fn(),
      upsertSubscription: jest.fn(),
      isEventProcessed: jest.fn().mockResolvedValue(false),
      markEventProcessed: jest.fn(),
      transaction: jest.fn((cb: (tx: any) => any) => cb({})),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: OutboxService, useValue: mockOutbox },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: BillingRepository, useValue: mockBillingRepo },
        { provide: "PAYMENT_PROVIDER", useValue: mockProvider },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    jest.clearAllMocks();
  });

  // ─── Checkout ───────────────────────────────────────────────────────

  describe("createCheckout", () => {
    it("calls payment provider and writes outbox event", async () => {
      mockProvider.createCheckoutSession.mockResolvedValue({
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
      mockBillingRepo.findCustomerByWorkspaceId.mockResolvedValue({
        id: "cust-1",
        providerCustomerId: "enc_polar_cus_abc",
      });
      mockProvider.createCheckoutSession.mockResolvedValue({
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
      mockProvider.handleWebhook.mockRejectedValue(
        new Error("Webhook signature verification failed"),
      );

      await expect(
        service.handleWebhook('{"event":"test"}', { "webhook-signature": "invalid" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("skips duplicate events based on idempotency check", async () => {
      mockProvider.handleWebhook.mockResolvedValue({
        id: "evt-1",
        type: "subscription.created",
        timestamp: new Date(),
        data: {},
        processed: true,
      });
      mockBillingRepo.isEventProcessed.mockResolvedValue(true);

      const result = await service.handleWebhook(
        '{"type":"subscription.created"}',
        {},
      );

      expect(result.id).toBe("evt-1");
      expect(mockBillingRepo.upsertSubscription).not.toHaveBeenCalled();
    });

    it("processes subscription.created and writes to DB + outbox", async () => {
      mockProvider.handleWebhook.mockResolvedValue({
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
      mockBillingRepo.findSubscriptionByWorkspaceId.mockResolvedValue({
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
