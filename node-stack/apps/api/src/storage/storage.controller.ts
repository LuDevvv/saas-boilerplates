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

import { GetPresignedUrlSchema } from "./dto/get-upload-url.dto";
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
  @ApiResponse({ status: 400, description: "Invalid file metadata or policy violation" })
  @ApiResponse({ status: 403, description: "Forbidden - Workspace access denied" })
  async getUploadUrl(
    @Body() body: unknown,
    @Workspace() workspace: WorkspaceContext,
    @CurrentUser() user: UserPayload,
  ) {
    const dto = GetPresignedUrlSchema.parse(body);
    return this.appStorageService.getPresignedUploadUrl(
      dto,
      workspace.id,
      user.id,
    );
  }

  @Post("confirm-upload")
  @UseGuards(IdempotencyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ 
    summary: "Confirm and Verify Upload",
    description: "Verifies that the file was actually uploaded to S3 and its size matches the initial request. Prevents key hijacking."
  })
  @ApiResponse({ status: 200, description: "Upload verified and cleared for use" })
  @ApiResponse({ status: 400, description: "Size mismatch or verification failed" })
  async confirmUpload(
    @Body() body: { key: string; expectedSize: number },
    @Workspace() workspace: WorkspaceContext,
  ) {
    const { key, expectedSize } = body;

    // Verify key belongs to this workspace (prevent key hijacking)
    if (!key.startsWith(`${workspace.id}/`)) {
      throw new ForbiddenException("Key does not belong to this workspace");
    }

    // Verify object exists in S3
    try {
      const head = await this.storage.headObject(key);

      // Verify declared size matches actual S3 object size
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
  @ApiOperation({ 
    summary: "Get secure download URL",
    description: "Returns a presigned URL for downloading a private file. Path must include workspace ID."
  })
  @ApiResponse({ status: 200, description: "Temporary download link generated" })
  @ApiResponse({ status: 404, description: "File not found" })
  async getFile(@Param("path") path: string) {
    const downloadUrl = await this.storage.getDownloadUrl(path);
    return { url: downloadUrl };
  }

  @Delete("*path")
  @ApiOperation({ 
    summary: "Permanently delete a file",
    description: "Removes the file from S3. Access is strictly scoped to the workspace context."
  })
  @ApiResponse({ status: 200, description: "File deleted successfully" })
  @ApiResponse({ status: 403, description: "Cannot delete files from other workspaces" })
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
