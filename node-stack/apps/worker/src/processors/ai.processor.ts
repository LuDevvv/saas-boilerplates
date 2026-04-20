import { Processor, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import {
  AIProvider,
  AIJob,
  AIJobResult,
  AI_PROVIDER_TOKEN,
  AIInsufficientQuotaError,
} from '@node-stack/ai-adapter';
import { CacheService } from '@node-stack/cache';
import { BaseWorker } from '../base.worker';

const PROMPT_TEMPLATES: Record<string, (j: AIJob) => string> = {
  'summarize-document': (j) =>
    `Summarize the following document concisely:\n\n${j.context}`,
  'classify-ticket': (j) =>
    `Classify this support ticket into one category (bug/feature/question/other):\n\n${j.prompt}`,
  'generate-description': (j) =>
    `Generate a professional product description for:\n\n${j.prompt}`,
  'analyze-usage': (j) =>
    `Analyze this usage data and provide insights:\n\n${j.context}`,
  'custom': (j) => j.prompt,
};

@Processor('ai')
export class AIProcessor extends BaseWorker {
  protected readonly logger = new Logger(AIProcessor.name);
  protected readonly queueName = 'ai';

  constructor(
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: AIProvider,
    private readonly cacheService: CacheService,
    @InjectQueue('dlq') private readonly dlqQueue: Queue,
  ) {
    super();
  }

  protected getDlqQueue(): Queue {
    return this.dlqQueue;
  }

  async processJob(job: Job<AIJob, AIJobResult, string>): Promise<AIJobResult> {
    const data = job.data;

    try {
      await job.updateProgress(10);

      const template = PROMPT_TEMPLATES[data.jobType];
      if (!template) {
        throw new Error(`Unknown AI job type: ${data.jobType}`);
      }

      const prompt = template(data);
      await job.updateProgress(30);

      const result = await this.aiProvider.complete({
        messages: [{ role: 'user', content: prompt }],
        model: data.model,
        workspaceId: data.workspaceId,
        jobId: String(job.id),
      });

      await job.updateProgress(90);

      const jobResult: AIJobResult = {
        jobId: String(job.id),
        result: result.content,
        model: result.model,
        tokens: { input: result.inputTokens, output: result.outputTokens },
        duration: result.durationMs,
      };

      // Cache result for 1 hour (client can poll for it)
      await this.cacheService.set(
        `ai:job:${job.id}`,
        JSON.stringify(jobResult),
        3600,
      );

      await job.updateProgress(100);

      // Emit cross-process event for real-time notification
      await this.cacheService.publish(`internal_events:workspace:${data.workspaceId}`, {
        type: 'ai_job.completed',
        payload: {
          userId: data.userId,
          workspaceId: data.workspaceId,
          jobId: String(job.id),
          result: jobResult,
        }
      });

      return jobResult;
    } catch (error: any) {
      if (error instanceof AIInsufficientQuotaError) {
        this.logger.error(
          `AI Job ${job.id} failed due to insufficient quota. Moving to FAILED without retry.`,
        );
        await job.moveToFailed(error, job.token || '', true);
        throw error;
      }
      throw error;
    }
  }
}
