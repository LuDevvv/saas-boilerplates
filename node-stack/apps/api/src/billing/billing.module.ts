import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { PaymentProvider } from "@node-stack/billing-adapter";
import { MockProvider } from "@node-stack/billing-adapter";
import { DatabaseModule } from "@node-stack/db";

import { BillingController } from "@/billing/billing.controller.js";
import { BillingService } from "@/billing/billing.service.js";
import { PlanLimitsService } from "@/billing/plan-limits.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    PlanLimitsService,
    {
      provide: "PAYMENT_PROVIDER",
      useFactory: async (config: ConfigService): Promise<PaymentProvider> => {
        const provider = config.get<string>("BILLING_PROVIDER", "mock");

        switch (provider) {
          case "polar": {
            const { PolarProvider } = await import(
              "@node-stack/billing-adapter"
            );
            return new PolarProvider({
              accessToken: config.getOrThrow("POLAR_ACCESS_TOKEN"),
              webhookSecret: config.get("POLAR_WEBHOOK_SECRET"),
              server: config.get("POLAR_SERVER", "production") as
                | "sandbox"
                | "production",
            });
          }
          case "mock":
          default:
            return new MockProvider();
        }
      },
      inject: [ConfigService],
    },
  ],
  // Export both services so other modules can inject PlanLimitsService
  // for feature gating and limit enforcement.
  exports: [BillingService, PlanLimitsService],
})
export class BillingModule {}
