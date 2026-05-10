import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly config: ConfigService) {}

  async sendWelcomeMessage(phone: string, firstName: string): Promise<void> {
    const phoneNumberId = this.config.get<string>("WHATSAPP_PHONE_NUMBER_ID");
    const accessToken =
      this.config.get<string>("WHATSAPP_ACCESS_TOKEN") ??
      this.config.get<string>("META_ACCESS_TOKEN");
    const templateName = this.config.get<string>("WHATSAPP_WELCOME_TEMPLATE") ?? "welcome_message";
    const apiVersion = this.config.get<string>("META_API_VERSION") ?? "v19.0";

    if (!phoneNumberId || !accessToken) {
      this.logger.debug("WhatsApp not configured — skipping welcome message");
      return;
    }

    // Normalize to E.164 — strip non-digits, prepend + if missing
    const normalized = phone.replace(/\D/g, "");

    const payload = {
      messaging_product: "whatsapp",
      to: normalized,
      type: "template",
      template: {
        name: templateName,
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: firstName }],
          },
        ],
      },
    };

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.warn(`WhatsApp welcome message failed for ${normalized}: ${res.status} ${body}`);
    } else {
      this.logger.log(`WhatsApp welcome message sent to ${normalized}`);
    }
  }
}
