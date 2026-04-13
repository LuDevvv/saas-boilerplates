import type { PaymentProvider } from "./interfaces/payment-provider.interface";
import { MockProvider } from "./providers/mock.provider";

export type ProviderType = "polar" | "mock";

export class BillingService {
  private provider!: PaymentProvider;
  private initialized = false;
  private initPromise: Promise<void>;

  constructor(providerType?: ProviderType) {
    this.initPromise = this.initProvider(providerType);
  }

  private async initProvider(providerType?: ProviderType): Promise<void> {
    const type =
      providerType || (process.env.BILLING_PROVIDER as ProviderType) || "mock";

    switch (type) {
      case "polar": {
        const { PolarProvider } = await import("./providers/polar.provider.js");
        this.provider = new PolarProvider(
          process.env.POLAR_ACCESS_TOKEN || "default-key",
          process.env.POLAR_WEBHOOK_SECRET,
        );
        break;
      }
      case "mock":
      default:
        this.provider = new MockProvider();
        break;
    }

    this.initialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  async createCustomer(data: Parameters<PaymentProvider["createCustomer"]>[0]) {
    await this.ensureInitialized();
    return this.provider.createCustomer(data);
  }

  async createSubscription(
    data: Parameters<PaymentProvider["createSubscription"]>[0],
  ) {
    await this.ensureInitialized();
    return this.provider.createSubscription(data);
  }

  async cancelSubscription(subscriptionId: string) {
    await this.ensureInitialized();
    return this.provider.cancelSubscription(subscriptionId);
  }

  async getSubscription(subscriptionId: string) {
    await this.ensureInitialized();
    return this.provider.getSubscription(subscriptionId);
  }

  async createCheckoutSession(
    data: Parameters<PaymentProvider["createCheckoutSession"]>[0],
  ) {
    await this.ensureInitialized();
    return this.provider.createCheckoutSession(data);
  }

  async handleWebhook(payload: any, signature?: string) {
    await this.ensureInitialized();
    return this.provider.handleWebhook(payload, signature);
  }
}
