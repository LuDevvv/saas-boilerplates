import { IEmailProvider, SendEmailOptions, EmailProviderResponse } from "./types";

export class ConsoleProvider implements IEmailProvider {
  public name = "console";

  async sendEmail(options: SendEmailOptions): Promise<EmailProviderResponse> {
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
    
    console.log("\n================ [DEV: EMAIL CONSOLE] ================\n");
    console.log(`[TO]: ${toAddresses.join(", ")}`);
    console.log(`[FROM]: ${options.from}`);
    console.log(`[SUBJECT]: ${options.subject}`);
    console.log(`[BODY LENGTH]: ${options.html.length} chars`);
    if (options.text) {
      console.log(`[TEXT]:\n${options.text}\n`);
    } else {
      console.log(`[HTML]:\n${options.html.substring(0, 500)}... [TRUNCATED]\n`);
    }
    console.log("======================================================\n");

    return {
      messageId: `console-${Date.now()}`,
    };
  }
}
