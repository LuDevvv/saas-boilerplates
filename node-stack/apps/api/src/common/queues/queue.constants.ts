/**
 * Centralized queue constants and type-safe job payload definitions.
 *
 * Every queue name and every job payload is declared here so that
 * producers (API) and consumers (Worker) share the same contract.
 */

// ─── Queue Names ──────────────────────────────────────────────────────
export const QUEUE_NAMES = {
  DEFAULT: 'default',
  AI: 'ai',
  NOTIFICATIONS: 'notifications',
  WEBHOOKS_DELIVERY: 'webhooks.delivery',
  OUTBOX: 'outbox',
  PORTABILITY: 'portability',
  DLQ: 'dlq',
} as const;


export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ─── Job Types (per queue) ────────────────────────────────────────────
export const JOB_TYPES = {
  // AI queue
  AI_PROCESS: 'process-ai',

  // Notifications queue
  SEND_EMAIL: 'send-email',
  SEND_PUSH: 'send-push',

  // Webhooks queue
  DELIVER_WEBHOOK: 'deliver-webhook',

  // Outbox queue
  PROCESS_OUTBOX: 'process-outbox',

  // Portability queue
  PROCESS_PORTABILITY: 'process-portability',

  // DLQ
  DEAD_LETTER: 'dead-letter',
} as const;


export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

// ─── Job Payloads ─────────────────────────────────────────────────────
export interface AIJobPayload {
  jobType: string;
  prompt: string;
  context?: string;
  model?: string;
  workspaceId: string;
  userId: string;
}

export interface EmailJobPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
  workspaceId?: string;
}

export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface WebhookDeliveryPayload {
  endpointId: string;
  payload: Record<string, unknown>;
  eventType?: string;
}

export interface OutboxJobPayload {
  outboxId: string;
}

export interface DeadLetterPayload {
  originalQueue: string;
  originalJobType: string;
  originalJobId: string;
  payload: unknown;
  failedReason: string;
  attemptsMade: number;
  failedAt: string;
}

export interface PortabilityJobPayload {
  requestId: string;
  workspaceId: string;
  userId: string;
}

// ─── Queue → Payload mapping (type utility) ───────────────────────────

export interface QueuePayloadMap {
  [QUEUE_NAMES.AI]: AIJobPayload;
  [QUEUE_NAMES.NOTIFICATIONS]: EmailJobPayload | PushNotificationPayload;
  [QUEUE_NAMES.WEBHOOKS_DELIVERY]: WebhookDeliveryPayload;
  [QUEUE_NAMES.OUTBOX]: OutboxJobPayload;
  [QUEUE_NAMES.PORTABILITY]: PortabilityJobPayload;
  [QUEUE_NAMES.DLQ]: DeadLetterPayload;
}


// ─── Default job options per queue ────────────────────────────────────
export const QUEUE_DEFAULT_OPTIONS = {
  [QUEUE_NAMES.DEFAULT]: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 3000 },
    removeOnComplete: { age: 3600, count: 500 },
    removeOnFail: { age: 172800, count: 1000 },
  },
  [QUEUE_NAMES.AI]: {
    attempts: 2,
    backoff: { type: 'exponential' as const, delay: 10000 },
    removeOnComplete: { age: 3600, count: 200 },
    removeOnFail: { age: 259200, count: 500 },
  },
  [QUEUE_NAMES.NOTIFICATIONS]: {
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 5000 },
    removeOnComplete: { age: 1800, count: 1000 },
    removeOnFail: { age: 172800, count: 500 },
  },
  [QUEUE_NAMES.WEBHOOKS_DELIVERY]: {
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 10000 },
    removeOnComplete: { age: 3600, count: 500 },
    removeOnFail: { age: 604800, count: 2000 },
  },
  [QUEUE_NAMES.OUTBOX]: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 5000 },
    removeOnComplete: { age: 3600, count: 500 },
    removeOnFail: { age: 172800, count: 500 },
  },
  [QUEUE_NAMES.PORTABILITY]: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 5000 },
    removeOnComplete: { age: 86400, count: 100 }, // 1 day
    removeOnFail: { age: 604800, count: 500 }, // 1 week
  },
  [QUEUE_NAMES.DLQ]: {

    attempts: 0,
    removeOnComplete: { age: 2592000, count: 5000 }, // 30 days
    removeOnFail: { age: 2592000, count: 5000 },
  },
} as const;
