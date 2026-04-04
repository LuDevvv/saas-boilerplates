import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { UserPayload } from '../common/types';
import { SubmitAIJobDto } from '@node-stack/validators';
import { AIJob } from '@node-stack/ai-adapter';
import { CacheService } from '@node-stack/cache';

@ApiTags('ai')
@ApiBearerAuth('JWT-auth')
@Controller('ai')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class AiController {
  constructor(
    @InjectQueue('ai') private readonly aiQueue: Queue,
    private readonly cacheService: CacheService,
  ) {}

  @Post('jobs')
  @HttpCode(202)
  @ApiOperation({ 
    summary: 'Submit an AI processing job',
    description: 'Enqueues a task for the AI worker. Returns a jobId to track status.'
  })
  @ApiResponse({ status: 202, description: 'Job accepted and queued' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitJob(
    @Body() dto: SubmitAIJobDto,
    @TenantId() workspaceId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const job = await this.aiQueue.add('process-ai', {
      ...dto,
      workspaceId,
      userId: user.id,
    } as AIJob);

    return { jobId: job.id, status: 'queued' };
  }

  @Get('jobs/:jobId')
  @ApiOperation({ 
    summary: 'Get AI job status and result',
    description: 'Retrieves the status and result of a previously submitted AI job.'
  })
  @ApiResponse({ status: 200, description: 'Job status retrieved' })
  async getJobResult(@Param('jobId') jobId: string) {
    const cached = await this.cacheService.get<any>(`ai:job:${jobId}`);
    if (!cached) {
      // Job still processing or expired
      return { status: 'pending' };
    }
    return { status: 'complete', ...cached };
  }
}
