import { IEmailProvider, SendEmailOptions, EmailProviderResponse } from "./types.js";

export class ConsoleProvider implements IEmailProvider {
  public name = "console";

  async sendEmail(options: SendEmailOptions): Promise<EmailProviderResponse> {
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
    
    console.warn("\n================ [DEV: EMAIL CONSOLE] ================\n");
    console.warn(`[TO]: ${toAddresses.join(", ")}`);
    console.warn(`[FROM]: ${options.from}`);
    console.warn(`[SUBJECT]: ${options.subject}`);
    console.warn(`[BODY LENGTH]: ${options.html.length} chars`);
    if (options.text) {
      console.warn(`[TEXT]:\n${options.text}\n`);
    } else {
      console.warn(`[HTML]:\n${options.html.substring(0, 500)}... [TRUNCATED]\n`);
    }
    console.warn("======================================================\n");

    return {
      messageId: `console-${Date.now()}`,
    };
  }
}
