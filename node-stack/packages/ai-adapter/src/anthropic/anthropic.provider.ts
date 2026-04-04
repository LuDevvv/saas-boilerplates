import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
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
export class AnthropicProvider implements AIProvider {
  private readonly client: Anthropic;
  readonly defaultModel = 'claude-sonnet-4-6';
  readonly providerName = 'anthropic';

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(params: AICompletionParams): Promise<AICompletionResult> {
    const start = Date.now();

    const systemMessage = params.messages.find((m) => m.role === 'system');
    const userMessages = params.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    try {
      const response = await this.client.messages.create({
        model: params.model ?? this.defaultModel,
        max_tokens: params.maxTokens ?? 1000,
        temperature: params.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: userMessages,
      });

      return {
        content: response.content
          .map((c) => ('text' in c ? c.text : ''))
          .join(''),
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        durationMs: Date.now() - start,
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new AIRateLimitError(this.providerName, error);
      }
      if (error.status === 401) {
        throw new AIAuthenticationError(this.providerName, error);
      }
      // Specifically for Anthropic, some quota errors might be 400 or have specific messages
      if (error.message?.toLowerCase().includes('quota')) {
        throw new AIInsufficientQuotaError(this.providerName, error);
      }
      throw new AIError(
        error.message || 'Error communicating with Anthropic',
        this.providerName,
        error
      );
    }
  }
}
