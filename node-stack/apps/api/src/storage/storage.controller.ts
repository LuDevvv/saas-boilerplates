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
import { GetPresignedUrlDto } from "@node-stack/validators";
import { Request } from "express";

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
  @Put("upload/*")
  @ApiOperation({ summary: "Handle local storage upload (Dev only)" })
  async uploadLocal(
    @Param("0") key: string,
    @Req() req: Request,
  ): Promise<{ ok: boolean }> {
    // If we're using the local provider, we need to save the raw body to disk.
    // The 'body' here might be a Buffer if we use a RawBody decorator or a custom middleware.
    // But since this is a dev boilerplate, we'll assume the local provider's 'upload'
    // method is what we want to call.

    // We'll use a stream-to-buffer approach for simplicity in dev.
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
    return {
      success: file.status === "uploaded",
      fileUrl: `${process.env.VITE_API_URL || "http://localhost:4000/api/v1"}/storage/${file.id}`,
    };
  }

  @Get(":fileId")
  @ApiOperation({ summary: "Get secure download URL by file ID" })
  @ApiResponse({ status: 200, description: "Download URL retrieved" })
  async getFile(
    @Param("fileId") fileId: string,
    @Workspace() workspace: WorkspaceContext,
  ): Promise<unknown> {
    return this.appStorageService.getDownloadUrl(fileId, workspace.id);
  }

  @Delete(":fileId")
  @ApiOperation({ summary: "Delete file" })
  @ApiResponse({ status: 200, description: "File deletion initiated" })
  async delete(
    @Param("fileId") _fileId: string,
    @Workspace() _workspace: WorkspaceContext,
  ): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: "Deletion not fully implemented in DB layer yet" };
  }
}
