import type { PaymentProvider } from "./interfaces/payment-provider.interface";
import { LemonSqueezyProvider } from "./providers/lemon-squeezy.provider";
import { MockProvider } from "./providers/mock.provider";
import { PolarProvider } from "./providers/polar.provider";
import { StripeProvider } from "./providers/stripe.provider";

export type ProviderType = "stripe" | "polar" | "lemon-squeezy" | "mock";

export class BillingService {
  private provider: PaymentProvider;

  constructor(providerType?: ProviderType) {
    const type =
      providerType || (process.env.BILLING_PROVIDER as ProviderType) || "mock";

    const apiKey =
      process.env.STRIPE_API_KEY ||
      process.env.POLAR_API_KEY ||
      process.env.LEMON_SQUEEZY_API_KEY ||
      "default-key";

    switch (type) {
      case "stripe":
        this.provider = new StripeProvider(apiKey);
        break;
      case "polar":
        this.provider = new PolarProvider(apiKey);
        break;
      case "lemon-squeezy":
        this.provider = new LemonSqueezyProvider(apiKey);
        break;
      case "mock":
      default:
        this.provider = new MockProvider();
        break;
    }
  }

  async createCustomer(data: Parameters<PaymentProvider["createCustomer"]>[0]) {
    return this.provider.createCustomer(data);
  }

  async createSubscription(
    data: Parameters<PaymentProvider["createSubscription"]>[0],
  ) {
    return this.provider.createSubscription(data);
  }

  async cancelSubscription(subscriptionId: string) {
    return this.provider.cancelSubscription(subscriptionId);
  }

  async getSubscription(subscriptionId: string) {
    return this.provider.getSubscription(subscriptionId);
  }

  async createCheckoutSession(
    data: Parameters<PaymentProvider["createCheckoutSession"]>[0],
  ) {
    return this.provider.createCheckoutSession(data);
  }

  async handleWebhook(payload: unknown) {
    return this.provider.handleWebhook(payload);
  }
}
