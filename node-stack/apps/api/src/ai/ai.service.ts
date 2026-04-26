import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAIProvider ,
  AICompletionParams,
  AICompletionResult,
  AIStreamChunk,
} from "@node-stack/ai-adapter";
import { AiRepository } from "@node-stack/db";

import { UsageQuotaService } from "@/analytics/usage-quota.service.js";


@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: OpenAIProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiRepository: AiRepository,
    private readonly usageQuotaService: UsageQuotaService,
  ) {
    const apiKey = this.configService.getOrThrow<string>("OPENAI_API_KEY");
    this.provider = new OpenAIProvider(apiKey);
  }

  async chat(
    workspaceId: string,
    userId: string,
    params: AICompletionParams,
  ): Promise<AICompletionResult> {
    await this.usageQuotaService.checkQuota(workspaceId, "ai");
    try {
      const result = await this.provider.complete(params);

      // Log usage asynchronously
      this.aiRepository.createLog({
        workspaceId,
        userId,
        model: result.model,
        provider: this.provider.providerName,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        prompt: JSON.stringify(params.messages),
        response: result.content,
        metadata: {
          durationMs: result.durationMs,
        },
      }).catch(err => this.logger.error("Failed to log AI usage", err));

      return result;
    } catch (error) {
      this.logger.error(`AI completion failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async *streamChat(
    workspaceId: string,
    userId: string,
    params: AICompletionParams,
  ): AsyncIterable<AIStreamChunk> {
    await this.usageQuotaService.checkQuota(workspaceId, "ai");
    const chunks: string[] = [];
    let outputTokens = 0;

    try {
      for await (const chunk of this.provider.stream(params)) {
        if (chunk.content) {
          chunks.push(chunk.content);
        }
        if (chunk.metadata?.outputTokens) {
          outputTokens = chunk.metadata.outputTokens;
        }
        
        yield chunk;

        if (chunk.isDone) {
          // Log usage
          this.aiRepository.createLog({
            workspaceId,
            userId,
            model: params.model ?? this.provider.defaultModel,
            provider: this.provider.providerName,
            // We don't have exact input tokens here unless we use a tokenizer
            inputTokens: 0, 
            outputTokens: outputTokens || chunks.join('').length / 4, // heuristic if missing
            prompt: JSON.stringify(params.messages),
            response: chunks.join(''),
            metadata: {
              isStream: true,
            },
          }).catch(err => this.logger.error("Failed to log AI stream usage", err));
        }
      }
    } catch (error) {
      this.logger.error(`AI stream failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUsage(workspaceId: string, since: Date): Promise<number> {
    return this.aiRepository.getMonthlyUsage(workspaceId, since);
  }
}
