import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
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
import { SubmitAIJobDto } from "@node-stack/validators";
import { CacheService } from "@node-stack/cache";

@ApiTags("ai")
@ApiBearerAuth("JWT-auth")
@Controller("ai")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class AiController {
  constructor(
    @InjectQueue("ai") private readonly aiQueue: Queue,
    private readonly cacheService: CacheService,
  ) {}

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
    const job = await this.aiQueue.add("process-ai", {
      ...dto,
      workspaceId: workspace.id,
      userId: user.id,
    });

    return { jobId: job.id, status: "queued" };
  }

  @Get("jobs/:jobId")
  @ApiOperation({ summary: "Get job status" })
  async getJobResult(@Param("jobId") jobId: string) {
    const cached = await this.cacheService.get<string>(`ai:job:${jobId}`);
    if (!cached) {
      return { status: "pending" };
    }
    
    // Check if it's already a JSON object or a string
    const result = typeof cached === "string" ? JSON.parse(cached) : cached;
    return { status: "complete", ...result };
  }
}
