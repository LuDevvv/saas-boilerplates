import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  UseGuards,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { WorkspaceGuard } from "../common/guards/workspace.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Workspace } from "../common/decorators/workspace.decorator";
import { UserPayload, WorkspaceContext } from "../common/types";
import { SubmitAIJobDto, ChatCompletionDto } from "@node-stack/validators";
import { CacheService } from "@node-stack/cache";
import { AiService } from "./ai.service";
import { JobService } from "../common/queues/job.service";
import { QUEUE_NAMES } from "../common/queues/queue.constants";
import { BillingGuard } from "../common/guards/billing.guard";

@ApiTags("ai")
@ApiBearerAuth("JWT-auth")
@Controller("ai")
@UseGuards(JwtAuthGuard, WorkspaceGuard, BillingGuard)
export class AiController {
  constructor(
    private readonly jobService: JobService,
    private readonly cacheService: CacheService,
    private readonly aiService: AiService,
  ) {}

  @Post("chat")
  @ApiOperation({ summary: "Synchronous AI chat completion" })
  async chat(
    @Body() dto: ChatCompletionDto,
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
  ) {
    return this.aiService.chat(workspace.id, user.id, {
      ...dto,
      jobId: `chat_${Date.now()}`,
      workspaceId: workspace.id,
    });
  }

  @Post("chat/stream")
  @ApiOperation({ summary: "Streaming AI chat completion" })
  async streamChat(
    @Body() dto: ChatCompletionDto,
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const iterable = this.aiService.streamChat(workspace.id, user.id, {
      ...dto,
      jobId: `stream_${Date.now()}`,
      workspaceId: workspace.id,
    });

    for await (const chunk of iterable) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.end();
  }

  @Post("jobs")
  @HttpCode(202)
  @ApiOperation({ 
    summary: "Submit AI job",
    description: "Enqueues a background task for AI processing. Results can be retrieved via polling or webhooks."
  })
  @ApiResponse({ status: 202, description: "Job accepted" })
  async submitJob(
    @Body() dto: SubmitAIJobDto,
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
  ) {
    const job = await this.jobService.addAIJob({
      ...dto,
      workspaceId: workspace.id,
      userId: user.id,
    });

    return { jobId: job.id, status: "queued" };
  }

  @Get("usage")
  @ApiOperation({ summary: "Get current AI usage for the workspace" })
  async getUsage(@Workspace() workspace: WorkspaceContext) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const usage = await this.aiService.getUsage(workspace.id, startOfMonth);
    
    // In a real app, you'd also fetch the plan limits here
    // For now, we'll return the usage value.
    return { usage };
  }

  @Get("jobs/:jobId")
  @ApiOperation({ summary: "Get job status" })
  async getJobResult(@Param("jobId") jobId: string) {
    // Try BullMQ native state first
    const jobStatus = await this.jobService.getJobStatus(QUEUE_NAMES.AI, jobId);
    if (jobStatus) {
      return jobStatus;
    }

    // Fallback to cache for completed jobs whose BullMQ record was cleaned up
    const cached = await this.cacheService.get<string>(`ai:job:${jobId}`);
    if (!cached) {
      return { status: "pending" };
    }
    
    const result = typeof cached === "string" ? JSON.parse(cached) : cached;
    return { status: "complete", ...result };
  }
}
