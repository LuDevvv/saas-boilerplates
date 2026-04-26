import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from "@nestjs/swagger";
import type { IStorageProvider } from "@node-stack/storage";
import { GetPresignedUrlDto } from "@node-stack/validators";

import { CurrentUser } from "@/auth/decorators/index.js";
import { JwtAuthGuard } from "@/auth/guards/jwt.guard.js";
import { Idempotent } from "@/common/decorators/idempotent.decorator.js";
import { Workspace } from "@/common/decorators/workspace.decorator.js";
import { WorkspaceGuard } from "@/common/guards/workspace.guard.js";
import type { UserPayload, WorkspaceContext } from "@/common/types/index.js";
import { AppStorageService } from "@/storage/storage.service.js";

@ApiTags("storage")
@ApiBearerAuth("JWT-auth")
@ApiHeader({
  name: "x-workspace-id",
  description: "The ID of the workspace context",
  required: true,
})
@Idempotent()
@Controller("storage")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class StorageController {
  constructor(
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
    private readonly appStorageService: AppStorageService,
  ) {}

  @Post("upload-url")
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
  @ApiOperation({ 
    summary: "Confirm and Verify Upload",
    description: "Verifies that the file was actually uploaded to the storage provider and updates its status in the DB."
  })
  @ApiResponse({ status: 200, description: "Upload confirmed" })
  async confirmUpload(
    @Body() body: { fileId: string },
    @Workspace() workspace: WorkspaceContext,
  ) {
    return this.appStorageService.completeUpload(body.fileId, workspace.id);
  }

  @Get(":fileId")
  @ApiOperation({ summary: "Get secure download URL by file ID" })
  @ApiResponse({ status: 200, description: "Download URL retrieved" })
  async getFile(
    @Param("fileId") fileId: string,
    @Workspace() workspace: WorkspaceContext,
  ) {
    return this.appStorageService.getDownloadUrl(fileId, workspace.id);
  }

  @Delete(":fileId")
  @ApiOperation({ summary: "Delete file" })
  @ApiResponse({ status: 200, description: "File deletion initiated" })
  async delete(
    @Param("fileId") fileId: string,
    @Workspace() workspace: WorkspaceContext,
  ) {
    return { ok: true, message: "Deletion not fully implemented in DB layer yet" };
  }
}
