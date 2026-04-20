import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const SubmitAIJobSchema = z.object({
  jobType: z
    .enum(["summarize-document", "classify-ticket", "generate-description", "analyze-usage", "custom"])
    .describe("The type of task for the AI processor (e.g. summarize-document)"),
  prompt: z
    .string()
    .min(1)
    .max(10_000)
    .describe("The main instruction or query for the AI"),
  context: z
    .string()
    .max(50_000)
    .optional()
    .describe("Additional text or document content to analyze"),
  model: z
    .string()
    .optional()
    .describe("Specific AI model to use (e.g. 'gpt-4o', 'claude-3-opus')"),
});

export class SubmitAIJobDto extends createZodDto(SubmitAIJobSchema) {}

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatCompletionSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export class ChatCompletionDto extends createZodDto(ChatCompletionSchema) {}
