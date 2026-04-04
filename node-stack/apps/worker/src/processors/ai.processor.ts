import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import {
  AIProvider,
  AIJob,
  AIJobResult,
  AI_PROVIDER_TOKEN,
  AIInsufficientQuotaError,
} from '@node-stack/ai-adapter';
import { CacheService } from '@node-stack/cache';

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
export class AIProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(AIProcessor.name);

  constructor(
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: AIProvider,
    private readonly cacheService: CacheService,
  ) {
    super();
  }

  /**
   * Lifecycle hook called by NestJS when the module is being destroyed (app.close()).
   * Gracefully closes the BullMQ AI worker — stops accepting new jobs and waits for
   * active AI jobs to finish before the process exits.
   */
  async onModuleDestroy() {
    this.logger.log(
      '[Worker] Gracefully closing BullMQ AI worker...',
    );
    await this.worker.close();
    this.logger.log('[Worker] AI worker closed.');
  }

  async process(job: Job<AIJob, AIJobResult, string>): Promise<AIJobResult> {
    const data = job.data;
    this.logger.log(`Processing AI job ${job.id} type=${data.jobType}`);

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
      this.logger.log(`AI job ${job.id} complete in ${result.durationMs}ms`);
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
