// BullMQ email queue payloads and queue definitions
export type EmailJobPayload = {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
};
