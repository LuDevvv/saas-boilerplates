import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
  AIProvider,
  AICompletionParams,
  AICompletionResult,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenRouterProvider implements AIProvider {
  private readonly client: OpenAI;
  readonly defaultModel = 'openai/gpt-4o-mini';
  readonly providerName = 'openrouter';

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://node-stack.com', // Replace with actual app URL if needed
        'X-Title': 'Node Stack SaaS',
      },
    });
  }

  async complete(params: AICompletionParams): Promise<AICompletionResult> {
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: params.model ?? this.defaultModel,
      messages: params.messages as any[], // cast to avoid SDK mismatch on types
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
  }

  async *stream(params: AICompletionParams): AsyncIterable<import('../interfaces/ai-provider.interface').AIStreamChunk> {
    const stream = await this.client.chat.completions.create({
      model: params.model ?? this.defaultModel,
      messages: params.messages as any[],
      max_tokens: params.maxTokens ?? 1000,
      temperature: params.temperature ?? 0.7,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    });

    let inputTokens = 0;
    let outputTokens = 0;
    let model = params.model ?? this.defaultModel;

    for await (const chunk of stream) {
      if (chunk.model) {
        model = chunk.model;
      }
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens;
        outputTokens = chunk.usage.completion_tokens;
      }

      const content = chunk.choices[0]?.delta?.content ?? '';
      const isDone = chunk.choices[0]?.finish_reason != null || chunk.choices.length === 0 && chunk.usage != null;

      yield {
        content,
        isDone,
        ...(isDone ? {
          metadata: {
            inputTokens,
            outputTokens,
            model,
          }
        } : {})
      };
    }
  }
}
