import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { MetaCapiService } from "@/marketing/meta-capi.service.js";
import { WhatsAppService } from "@/marketing/whatsapp.service.js";

interface LeadCapturedPayload {
  userId: string;
  email: string;
  phone?: string;
  firstName?: string;
}

interface WorkspaceCreatedPayload {
  workspaceId: string;
  userId: string;
  name: string;
  userEmail?: string;
  userPhone?: string;
  userFirstName?: string;
}

@Injectable()
export class MarketingEventListener {
  private readonly logger = new Logger(MarketingEventListener.name);

  constructor(
    private readonly metaCapi: MetaCapiService,
    private readonly whatsApp: WhatsAppService,
  ) {}

  @OnEvent("user.lead.captured", { async: true })
  async handleLeadCaptured(payload: LeadCapturedPayload): Promise<void> {
    this.logger.log(`Lead captured for user ${payload.userId}`);
    await Promise.allSettled([
      this.metaCapi.sendLeadEvent({
        email: payload.email,
        phone: payload.phone,
        firstName: payload.firstName,
      }),
      payload.phone
        ? this.whatsApp.sendWelcomeMessage(payload.phone, payload.firstName ?? "")
        : Promise.resolve(),
    ]);
  }

  @OnEvent("workspace.created", { async: true })
  async handleWorkspaceCreated(payload: WorkspaceCreatedPayload): Promise<void> {
    if (!payload.userEmail) return;
    await this.metaCapi.sendCompleteRegistrationEvent(
      {
        email: payload.userEmail,
        phone: payload.userPhone,
        firstName: payload.userFirstName,
      },
      payload.name,
    );
  }
}
