import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

export const SubmitAIJobSchema = z.object({
  jobType: z
    .enum(["summarize-document", "classify-ticket", "generate-description", "analyze-usage", "custom"])
    .describe("The type of task for the AI processor"),
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
    .describe("Specific AI model to use"),
});

export class SubmitAIJobDto extends createZodDto(SubmitAIJobSchema) {
  @ApiProperty({ example: "summarize-document", enum: ["summarize-document", "classify-ticket", "generate-description", "analyze-usage", "custom"] })
  jobType!: "summarize-document" | "classify-ticket" | "generate-description" | "analyze-usage" | "custom";

  @ApiProperty({ example: "Please summarize this report." })
  prompt!: string;

  @ApiProperty({ example: "The report content is...", required: false })
  context?: string;

  @ApiProperty({ example: "gpt-4o", required: false })
  model?: string;
}

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export class ChatMessageDto {
  @ApiProperty({ example: "user", enum: ["system", "user", "assistant"] })
  role!: "system" | "user" | "assistant";

  @ApiProperty({ example: "Hello, AI!" })
  content!: string;
}

export const ChatCompletionSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export class ChatCompletionDto extends createZodDto(ChatCompletionSchema) {
  @ApiProperty({ type: [ChatMessageDto] })
  messages!: ChatMessageDto[];

  @ApiProperty({ example: "gpt-4o", required: false })
  model?: string;

  @ApiProperty({ example: 1000, required: false })
  maxTokens?: number;

  @ApiProperty({ example: 0.7, required: false })
  temperature?: number;
}
