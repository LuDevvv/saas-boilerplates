import * as crypto from "node:crypto";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
}

interface CapiEvent {
  event_name: string;
  event_time: number;
  event_source_url?: string;
  user_data: Record<string, string[]>;
  custom_data?: Record<string, unknown>;
  test_event_code?: string;
}

@Injectable()
export class MetaCapiService {
  private readonly logger = new Logger(MetaCapiService.name);

  constructor(private readonly config: ConfigService) {}

  private sha256(value: string): string {
    return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
  }

  private buildUserData(user: UserData): Record<string, string[]> {
    const data: Record<string, string[]> = {};
    if (user.email) data["em"] = [this.sha256(user.email)];
    if (user.phone) data["ph"] = [this.sha256(user.phone.replace(/\D/g, ""))];
    if (user.firstName) data["fn"] = [this.sha256(user.firstName)];
    return data;
  }

  private async sendEvent(event: CapiEvent): Promise<void> {
    const pixelId = this.config.get<string>("META_PIXEL_ID");
    const accessToken = this.config.get<string>("META_ACCESS_TOKEN");
    const apiVersion = this.config.get<string>("META_API_VERSION") ?? "v19.0";
    const testCode = this.config.get<string>("META_TEST_EVENT_CODE");

    if (!pixelId || !accessToken) {
      this.logger.debug("Meta CAPI not configured — skipping event");
      return;
    }

    const payload: Record<string, unknown> = {
      data: [{ ...event, ...(testCode ? { test_event_code: testCode } : {}) }],
      access_token: accessToken,
    };

    const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.warn(`Meta CAPI ${event.event_name} failed: ${res.status} ${body}`);
    } else {
      this.logger.log(`Meta CAPI ${event.event_name} sent`);
    }
  }

  async sendLeadEvent(user: UserData): Promise<void> {
    await this.sendEvent({
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      user_data: this.buildUserData(user),
    });
  }

  async sendCompleteRegistrationEvent(user: UserData, workspaceName: string): Promise<void> {
    await this.sendEvent({
      event_name: "CompleteRegistration",
      event_time: Math.floor(Date.now() / 1000),
      user_data: this.buildUserData(user),
      custom_data: { content_name: workspaceName },
    });
  }
}
