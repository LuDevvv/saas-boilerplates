import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

import {
  AIError,
  AIInsufficientQuotaError,
  AIRateLimitError,
  AIAuthenticationError,
} from '../errors/ai-errors.js';
import {
  AIProvider,
  AICompletionParams,
  AICompletionResult,
  AIStreamChunk,
} from '../interfaces/ai-provider.interface.js';

interface UpstreamError {
  status?: number;
  code?: string;
  message?: string;
}

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;
  readonly defaultModel = 'gpt-4o-mini';
  readonly providerName = 'openai';

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(params: AICompletionParams): Promise<AICompletionResult> {
    const start = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: params.model ?? this.defaultModel,
        messages: params.messages,
        max_tokens: params.maxTokens ?? 1000,
        temperature: params.temperature ?? 0.7,
      });

      const choice = response.choices[0]!;
      return {
        content: choice.message.content ?? '',
        model: response.model,
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        durationMs: Date.now() - start,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async *stream(params: AICompletionParams): AsyncIterable<AIStreamChunk> {
    const model = params.model ?? this.defaultModel;

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: params.messages,
        max_tokens: params.maxTokens ?? 1000,
        temperature: params.temperature ?? 0.7,
        stream: true,
        stream_options: { include_usage: true },
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? '';
        const usage = chunk.usage;

        yield {
          content,
          isDone: !!chunk.choices[0]?.finish_reason,
          metadata: usage
            ? {
                inputTokens: usage.prompt_tokens,
                outputTokens: usage.completion_tokens,
                model: chunk.model,
              }
            : undefined,
        };
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    const err = error as UpstreamError;
    if (err.status === 429) {
      if (err.code === 'insufficient_quota') {
        throw new AIInsufficientQuotaError(this.providerName, error);
      }
      throw new AIRateLimitError(this.providerName, error);
    }
    if (err.status === 401) {
      throw new AIAuthenticationError(this.providerName, error);
    }
    throw new AIError(
      err.message || 'Error communicating with OpenAI',
      this.providerName,
      error,
    );
  }
}
