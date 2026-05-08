export interface WebhookEndpoint {
  id: string;
  url: string;
  enabled: boolean;
  secret: string;
  eventTypes: string[];
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  provider: string;
  status: number;
  message: string;
  payload: unknown;
  headers: Record<string, string>;
  sourceIp: string;
  eventId?: string;
  createdAt: string;
}
