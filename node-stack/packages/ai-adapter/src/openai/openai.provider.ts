import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
  AIProvider,
  AICompletionParams,
  AICompletionResult,
} from '../interfaces/ai-provider.interface';
import {
  AIError,
  AIInsufficientQuotaError,
  AIRateLimitError,
  AIAuthenticationError,
} from '../errors/ai-errors';

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

      const choice = response.choices[0];
      return {
        content: choice.message.content ?? '',
        model: response.model,
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        durationMs: Date.now() - start,
      };
    } catch (error: any) {
      if (error.status === 429) {
        if (error.code === 'insufficient_quota') {
          throw new AIInsufficientQuotaError(this.providerName, error);
        }
        throw new AIRateLimitError(this.providerName, error);
      }
      if (error.status === 401) {
        throw new AIAuthenticationError(this.providerName, error);
      }
      throw new AIError(
        error.message || 'Error communicating with OpenAI',
        this.providerName,
        error
      );
    }
  }
}
