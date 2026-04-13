import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Inject,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import type { StorageService } from "@node-stack/storage";
import { GetPresignedUrlDto } from "@node-stack/validators";

import { AppStorageService } from "./storage.service";
import { CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { Workspace } from "../common/decorators/workspace.decorator";
import { IdempotencyGuard } from "../common/guards/idempotency.guard";
import { WorkspaceGuard } from "../common/guards/workspace.guard";
import { IdempotencyInterceptor } from "../common/interceptors/idempotency.interceptor";
import type { UserPayload, WorkspaceContext } from "../common/types";

@ApiTags("storage")
@ApiBearerAuth("JWT-auth")
@Controller("storage")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class StorageController {
  constructor(
    @Inject("STORAGE_SERVICE") private readonly storage: StorageService,
    private readonly appStorageService: AppStorageService,
  ) {}

  @Post("upload-url")
  @UseGuards(IdempotencyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({
    summary: "Request a presigned upload URL",
    description: "Generates a temporary S3 URL for direct client-side upload. Validates file size and type against context policies (avatar, attachment, export).",
  })
  @ApiResponse({ status: 201, description: "Presigned URL generated successfully" })
  async getUploadUrl(
    @Body() body: GetPresignedUrlDto,
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
  ) {
    return this.appStorageService.getPresignedUploadUrl(
      body,
      workspace.id,
      user.id,
    );
  }

  @Post("confirm-upload")
  @UseGuards(IdempotencyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ 
    summary: "Confirm and Verify Upload",
    description: "Verifies that the file was actually uploaded to S3 and its size matches the initial request."
  })
  async confirmUpload(
    @Body() body: { key: string; expectedSize: number },
    @Workspace() workspace: WorkspaceContext,
  ) {
    const { key, expectedSize } = body;

    if (!key.startsWith(`${workspace.id}/`)) {
      throw new ForbiddenException("Key does not belong to this workspace");
    }

    try {
      const head = await this.storage.headObject(key);

      if (head.contentLength !== expectedSize) {
        await this.storage.delete(key);
        throw new BadRequestException("Upload size mismatch — file rejected");
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new NotFoundException("Upload not found or expired");
    }

    return { ok: true, key, size: expectedSize };
  }

  @Get("*path")
  @ApiOperation({ summary: "Get secure download URL" })
  async getFile(@Param("path") path: string) {
    const downloadUrl = await this.storage.getDownloadUrl(path);
    return { url: downloadUrl };
  }

  @Delete("*path")
  @ApiOperation({ summary: "Delete file" })
  async delete(
    @Param("path") path: string,
    @Workspace() workspace: WorkspaceContext,
  ) {
    if (!path.includes(workspace.id)) {
      throw new ForbiddenException("Cannot delete files from other workspaces");
    }
    await this.storage.delete(path);
    return { ok: true };
  }
}
