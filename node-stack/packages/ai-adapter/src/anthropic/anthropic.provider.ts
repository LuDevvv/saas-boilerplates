import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import {
  AIProvider,
  AICompletionParams,
  AICompletionResult,
  AIStreamChunk,
} from '../interfaces/ai-provider.interface.js';
import {
  AIError,
  AIInsufficientQuotaError,
  AIRateLimitError,
  AIAuthenticationError,
} from '../errors/ai-errors.js';

@Injectable()
export class AnthropicProvider implements AIProvider {
  private readonly client: Anthropic;
  readonly defaultModel = 'claude-3-5-sonnet-20240620';
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
      this.handleError(error);
    }
  }

  async *stream(params: AICompletionParams): AsyncIterable<AIStreamChunk> {
    const systemMessage = params.messages.find((m) => m.role === 'system');
    const userMessages = params.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    try {
      const stream = await this.client.messages.create({
        model: params.model ?? this.defaultModel,
        max_tokens: params.maxTokens ?? 1000,
        temperature: params.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: userMessages,
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield {
            content: event.delta.text,
            isDone: false,
          };
        }

        if (event.type === 'message_stop') {
          // message_stop doesn't have usage in the same event usually, 
          // usage comes in message_start or message_delta
          yield {
            content: '',
            isDone: true,
          };
        }

        if (event.type === 'message_delta') {
           // Anthropic sends usage here
           if (event.usage) {
             yield {
               content: '',
               isDone: false,
               metadata: {
                 outputTokens: event.usage.output_tokens,
               }
             };
           }
        }
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.status === 429) {
      throw new AIRateLimitError(this.providerName, error);
    }
    if (error.status === 401) {
      throw new AIAuthenticationError(this.providerName, error);
    }
    if (error.message?.toLowerCase().includes('quota')) {
      throw new AIInsufficientQuotaError(this.providerName, error);
    }
    throw new AIError(
      error.message || 'Error communicating with Anthropic',
      this.providerName,
      error,
    );
  }
}
