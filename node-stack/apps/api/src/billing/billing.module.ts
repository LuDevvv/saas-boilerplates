import { Module } from "@nestjs/common";
import { ConfigService, ConfigModule } from "@nestjs/config";
import type { PaymentProvider } from "@node-stack/billing-adapter";
import { MockProvider } from "@node-stack/billing-adapter";
import { DatabaseModule } from "@node-stack/db";

import { BillingController } from "@/billing/billing.controller.js";
import { BillingService } from "@/billing/billing.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    {
      provide: "PAYMENT_PROVIDER",
      useFactory: async (config: ConfigService): Promise<PaymentProvider> => {
        const provider = config.get("BILLING_PROVIDER", "mock");

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
  exports: [BillingService],
})
export class BillingModule {}
