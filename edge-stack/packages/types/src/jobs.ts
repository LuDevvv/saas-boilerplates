import { z } from "zod";

export const EmailJobPayloadSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  templateName: z.enum(["welcome", "reset_password", "invitation", "receipt"]),
  templateData: z.record(z.any()),
  traceId: z.string().optional(),
});

export type EmailJobPayload = z.infer<typeof EmailJobPayloadSchema>;
