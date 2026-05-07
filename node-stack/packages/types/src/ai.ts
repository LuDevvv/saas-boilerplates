export interface ChatMessageDto {
  role: "user" | "assistant" | "system";
  content: string;
}

export type SubmitAIJobDto = any;
export type ChatCompletionDto = any;

export type AIJobStatus = "pending" | "processing" | "completed" | "failed";

export interface AIJob {
  id: string;
  type: string;
  status: AIJobStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AiUsage {
  tokensUsed: number;
  cost: number;
  model: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}
