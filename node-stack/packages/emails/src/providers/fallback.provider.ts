import { IEmailProvider, SendEmailOptions, EmailProviderResponse } from "./types.js";

export class FallbackProvider implements IEmailProvider {
  public name = "fallback";
  private providers: IEmailProvider[];

  constructor(providers: IEmailProvider[]) {
    this.providers = providers;
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailProviderResponse> {
    let lastError: Error | undefined;

    for (const provider of this.providers) {
      try {
        console.warn(`[EmailProvider] Attempting to send via ${provider.name}...`);
        const result = await provider.sendEmail(options);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`[EmailProvider] Provider ${provider.name} failed:`, error);
      }
    }

    throw new Error(`All email providers failed. Last error: ${lastError?.message}`);
  }
}
