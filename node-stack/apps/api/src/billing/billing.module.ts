import { Module } from "@nestjs/common";
import { ConfigService, ConfigModule } from "@nestjs/config";
import type { PaymentProvider } from "@node-stack/billing-adapter";
import { MockProvider } from "@node-stack/billing-adapter";

import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { DatabaseModule } from "../common/database/database.module";
import { EncryptionService } from "../common/services/encryption.service";

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    EncryptionService,
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
  exports: [BillingService, EncryptionService],
})
export class BillingModule {}
