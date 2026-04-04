export interface OutboxEventPayload {
  [key: string]: unknown;
}

export interface ProcessedOutboxEvent {
  id: string;
  eventType: string;
  payload: OutboxEventPayload;
  processedAt: Date;
}

export type EventHandler = (event: {
  id: string;
  eventType: string;
  payload: OutboxEventPayload;
}) => Promise<void>;

export interface EventHandlers {
  [eventType: string]: EventHandler;
}
