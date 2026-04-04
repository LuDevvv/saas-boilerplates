export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionParams {
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jobId: string;    // for progress tracking
  workspaceId: string;
}

export interface AICompletionResult {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

export type AIJobType =
  | 'summarize-document'
  | 'classify-ticket'
  | 'generate-description'
  | 'analyze-usage'
  | 'custom';

export interface AIJob {
  jobType: AIJobType;
  prompt: string;
  context?: string;        // additional context for the prompt
  model?: string;
  workspaceId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface AIJobResult {
  jobId: string;
  result: string;
  model: string;
  tokens: { input: number; output: number };
  duration: number;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER';

export interface AIProvider {
  complete(params: AICompletionParams): Promise<AICompletionResult>;
  readonly defaultModel: string;
  readonly providerName: string;
}
