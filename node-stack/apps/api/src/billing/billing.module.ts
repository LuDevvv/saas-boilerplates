import { Module } from "@nestjs/common";
import { ConfigService, ConfigModule } from "@nestjs/config";
import type { PaymentProvider } from "@node-stack/billing-adapter";
import { MockProvider } from "@node-stack/billing-adapter";

import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { DatabaseModule } from "../common/database/database.module";

@Module({
  imports: [ConfigModule, DatabaseModule],
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
              "@node-stack/billing-adapter/dist/providers/polar.provider.js"
            );
            return new PolarProvider(
              config.getOrThrow("POLAR_ACCESS_TOKEN"),
              config.get("POLAR_WEBHOOK_SECRET"),
            );
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
