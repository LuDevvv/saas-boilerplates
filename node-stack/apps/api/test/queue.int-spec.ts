import { Test, TestingModule } from '@nestjs/testing';
import { QueueModule } from '../src/common/queues/queue.module.js';
import { JobService } from '../src/common/queues/job.service.js';
import { QUEUE_NAMES } from '../src/common/queues/queue.constants.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ConfigModule } from '@nestjs/config';

describe('Queue Integration (BullMQ + Redis)', () => {
  let module: TestingModule;
  let jobService: JobService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({
            REDIS_HOST: process.env.REDIS_HOST,
            REDIS_PORT: process.env.REDIS_PORT,
          })]
        }),
        QueueModule,
      ],
    }).compile();

    jobService = module.get<JobService>(JobService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should successfully enqueue a job into Redis', async () => {
    const payload = {
      jobType: 'test-job',
      workspaceId: 'ws-123',
      userId: 'user-123',
      prompt: 'Hello AI',
    };

    // @ts-ignore - Generic payload for testing
    const job = await jobService.addAIJob(payload as any);

    expect(job.id).toBeDefined();
    
    const status = await jobService.getJobStatus(QUEUE_NAMES.AI, job.id!);
    expect(status).not.toBeNull();
    expect(status?.id).toBe(job.id);
    expect(status?.state).toBe('waiting');
  });
});
