import { Injectable, Logger } from "@nestjs/common";
import { OutboxEvent } from "@node-stack/db";

export type EventHandlers = Record<string, (event: OutboxEvent) => Promise<void>>;

@Injectable()
export class UserEventHandler {
  private readonly logger = new Logger(UserEventHandler.name);

  async handleUserCreated(event: OutboxEvent): Promise<void> {
    this.logger.log(`Processing user.created event: ${event.id}`);
    const payload = event.payload as { userId: string; email: string };

    // Example: Send welcome email, update analytics, etc.
    this.logger.log(`User created: ${payload.email} (${payload.userId})`);

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  async handleSubscriptionActivated(event: OutboxEvent): Promise<void> {
    this.logger.log(`Processing subscription.activated event: ${event.id}`);
    const payload = event.payload as {
      subscriptionId: string;
      customerId: string;
    };

    this.logger.log(`Subscription activated: ${payload.subscriptionId}`);
  }

  async handleInvitationSent(event: OutboxEvent): Promise<void> {
    this.logger.log(`Processing invitation.sent event: ${event.id}`);
    const payload = event.payload as { invitationId: string; email: string };

    this.logger.log(`Invitation sent to: ${payload.email}`);
  }
}

// Export event handlers for the processor
export const getEventHandlers = (
  userEventHandler: UserEventHandler,
): EventHandlers => ({
  "user.created": (event) => userEventHandler.handleUserCreated(event),
  "subscription.activated": (event) =>
    userEventHandler.handleSubscriptionActivated(event),
  "invitation.sent": (event) => userEventHandler.handleInvitationSent(event),
});
