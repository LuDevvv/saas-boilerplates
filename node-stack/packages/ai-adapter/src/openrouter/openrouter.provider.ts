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
}
