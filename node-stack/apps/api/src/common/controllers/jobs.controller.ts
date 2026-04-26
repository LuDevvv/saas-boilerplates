import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard.js';
import { AdminGuard } from '@/common/guards/admin.guard.js';
import { JobService } from '@/common/queues/job.service.js';
import { QUEUE_NAMES, type QueueName } from '@/common/queues/queue.constants.js';

/**
 * Admin-only endpoint for job tracking and queue observability.
 *
 * Provides real-time visibility into queue health and individual job
 * status without requiring external tools like BullBoard.
 */
@ApiTags('jobs')
@ApiBearerAuth('JWT-auth')
@Controller('jobs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class JobsController {
  constructor(private readonly jobService: JobService) {}

  @Get('queues')
  @ApiOperation({ summary: 'Get all queue stats (Admin only)' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStats() {
    const queueNames = Object.values(QUEUE_NAMES);
    const stats = await Promise.all(
      queueNames.map((name) => this.jobService.getQueueStats(name)),
    );
    return {
      queues: stats.filter(Boolean),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('queues/:queueName')
  @ApiOperation({ summary: 'Get stats for a specific queue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStatsByName(@Param('queueName') queueName: string) {
    const stats = await this.jobService.getQueueStats(queueName);
    if (!stats) {
      throw new NotFoundException(`Queue "${queueName}" not found`);
    }
    return stats;
  }

  @Get(':queueName/:jobId')
  @ApiOperation({ summary: 'Get a specific job status (Admin only)' })
  @ApiQuery({
    name: 'queueName',
    description: 'Queue name (e.g., ai, notifications, outbox)',
  })
  @ApiResponse({ status: 200, description: 'Job status' })
  async getJobStatus(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    const status = await this.jobService.getJobStatus(queueName, jobId);
    if (!status) {
      throw new NotFoundException(
        `Job "${jobId}" not found in queue "${queueName}"`,
      );
    }
    return status;
  }
}
