/**
 * Defines all supported background task types.
 * Ensures strict typing across both the Producer (API) and Consumer (Worker).
 */
export enum JobType {
  SEND_WELCOME_EMAIL = "SEND_WELCOME_EMAIL",
  PROCESS_PAYMENT_WEBHOOK = "PROCESS_PAYMENT_WEBHOOK",
  GENERATE_TICKET_PDF = "GENERATE_TICKET_PDF",
  SYNC_USAGE_METRICS = "SYNC_USAGE_METRICS",
  LOG_ACTIVITY = "LOG_ACTIVITY",
  PROCESS_IMAGE_METADATA = "PROCESS_IMAGE_METADATA",
  SEND_PASSWORD_RESET_EMAIL = "SEND_PASSWORD_RESET_EMAIL",
}

/**
 * Standard structured message format for Cloudflare Queues.
 */
export interface QueueMessage<T = any> {
  /**
   * The unique identifier for the type of task to perform.
   */
  type: JobType;

  /**
   * Task-specific payload required for execution.
   */
  payload: T;

  /**
   * ISO timestamp of when the job was enqueued for audit/timeout checks.
   */
  timestamp: number;
}
