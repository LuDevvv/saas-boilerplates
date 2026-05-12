import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Req,
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
import type { FileInfo } from "@node-stack/types";
import { GetPresignedUrlDto } from "@node-stack/validators";
import type { Request } from "express";

import { CurrentUser } from "@/auth/decorators/index.js";
import { JwtAuthGuard } from "@/auth/guards/jwt.guard.js";
import { Idempotent } from "@/common/decorators/idempotent.decorator.js";
import { Public } from "@/common/decorators/public.decorator.js";
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

  @Public()
  @Put("upload/*path")
  @ApiOperation({ summary: "Handle local storage upload (Dev only)" })
  async uploadLocal(
    @Param("path") key: string,
    @Req() req: Request,
  ): Promise<{ ok: boolean }> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);

    await this.storage.upload({
      key,
      body: buffer,
    });

    return { ok: true };
  }

  @Get()
  @ApiOperation({ summary: "List workspace files" })
  @ApiResponse({ status: 200, description: "List of uploaded files" })
  async listFiles(
    @Workspace() workspace: WorkspaceContext,
  ): Promise<FileInfo[]> {
    return this.appStorageService.listFiles(workspace.id);
  }

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
  ): Promise<{ uploadUrl: string; fileUrl: string; expiresIn: number }> {
    const result = await this.appStorageService.getPresignedUploadUrl(
      body,
      workspace.id,
      user.id,
    );

    return {
      uploadUrl: result.url,
      fileUrl: `${process.env.VITE_API_URL || "http://localhost:4000/api/v1"}/storage/${result.fileId}`,
      expiresIn: 300,
    };
  }

  @Post("confirm-upload")
  @ApiOperation({
    summary: "Confirm and Verify Upload",
    description:
      "Verifies that the file was actually uploaded to the storage provider and updates its status in the DB.",
  })
  @ApiResponse({ status: 200, description: "Upload confirmed" })
  async confirmUpload(
    @Body() body: { fileId: string },
    @Workspace() workspace: WorkspaceContext,
  ): Promise<{ success: boolean; fileUrl: string }> {
    const file = await this.appStorageService.completeUpload(
      body.fileId,
      workspace.id,
    );
    // Prefer a permanent public R2 URL (served via Cloudflare CDN, cached globally)
    // over a presigned URL so avatarUrl/logoUrl never expire and benefit from CDN.
    // Falls back to a 7-day presigned URL when STORAGE_S3_PUBLIC_URL is not set.
    const fileUrl = await this.appStorageService.getPublicOrSignedUrl(
      file.key,
      7 * 24 * 60 * 60,
    );

    // Fire-and-forget thumbnail generation — runs after the response is sent.
    // Does not block the HTTP response; failure is logged and never surfaces.
    void this.appStorageService.generateThumbnailAsync(file.id, workspace.id);

    return { success: file.status === "uploaded", fileUrl };
  }

  @Get(":fileId")
  @ApiOperation({ summary: "Get secure download URL by file ID" })
  @ApiResponse({ status: 200, description: "Download URL retrieved" })
  async getFile(
    @Param("fileId") fileId: string,
    @Workspace() workspace: WorkspaceContext,
  ): Promise<{ url: string }> {
    return this.appStorageService.getDownloadUrl(fileId, workspace.id);
  }

  @Delete(":fileId")
  @ApiOperation({ summary: "Delete file" })
  @ApiResponse({ status: 200, description: "File deleted" })
  async delete(
    @Param("fileId") fileId: string,
    @Workspace() workspace: WorkspaceContext,
  ): Promise<{ ok: boolean }> {
    await this.appStorageService.deleteFile(fileId, workspace.id);
    return { ok: true };
  }
}
