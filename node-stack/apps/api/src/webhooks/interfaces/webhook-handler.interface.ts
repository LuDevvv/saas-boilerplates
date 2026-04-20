/**
 * Contract that every inbound webhook provider adapter must implement.
 *
 * Adding a new provider (e.g. LemonSqueezy, Clerk) is as simple as:
 *   1. Create a class that implements `InboundWebhookHandler`
 *   2. Register it in the `WEBHOOK_HANDLERS` map inside `webhooks.module.ts`
 *   3. Add the provider name to the `webhookProviderEnum` in the schema
 *
 * The system will route `/webhooks/:provider` traffic to the correct handler
 * automatically.
 */
export interface InboundWebhookHandler {
  /**
   * Unique provider identifier. Must match the route parameter
   * and the `webhookProviderEnum` database value.
   */
  readonly provider: string;

  /**
   * Validate the webhook signature using the provider's verification method.
   *
   * @param rawBody  - The raw, unparsed request body (Buffer)
   * @param headers  - The full HTTP headers object
   * @returns `true` if signature is valid
   * @throws  Should NOT throw — return `false` on invalid signatures
   */
  validateSignature(rawBody: Buffer, headers: Record<string, string>): Promise<boolean>;

  /**
   * Extract the provider's event ID from the payload/headers.
   * This is used for idempotency checking (e.g. Stripe's `evt_xxx`).
   *
   * @param rawBody - The raw request body
   * @param headers - The HTTP headers
   */
  extractEventId(rawBody: Buffer, headers: Record<string, string>): string;

  /**
   * Extract the event type string from the payload (e.g. "invoice.payment_succeeded").
   *
   * @param rawBody - The raw request body
   * @param headers - The HTTP headers
   */
  extractEventType(rawBody: Buffer, headers: Record<string, string>): string;

  /**
   * Transform the provider-specific payload into a normalised internal event.
   *
   * @param rawBody - The raw request body
   * @param headers - The HTTP headers
   * @returns A normalised event object ready for internal emission
   */
  transformEvent(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): Promise<TransformedWebhookEvent>;
}

/**
 * Normalised webhook event produced by any provider handler.
 * This is what gets emitted on the internal EventEmitter2 bus.
 */
export interface TransformedWebhookEvent {
  /** The internal event name (e.g. "billing.invoice.paid", "auth.user.created") */
  internalEventName: string;

  /** The provider's original event type */
  providerEventType: string;

  /** The provider's event ID */
  providerEventId: string;

  /** The provider name */
  provider: string;

  /** The normalised payload to broadcast internally */
  payload: Record<string, unknown>;

  /** Optional metadata for routing/filtering */
  metadata?: Record<string, unknown>;
}
