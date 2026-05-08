import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UPLOAD_POLICIES = {
  avatar: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  },
  attachment: {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "text/plain",
    ],
    allowedExtensions: [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".xlsx",
      ".xls",
      ".csv",
      ".txt",
    ],
  },
  export: {
    maxSizeBytes: 100 * 1024 * 1024,
    allowedMimeTypes: ["application/json", "text/csv"],
    allowedExtensions: [".json", ".csv"],
  },
} as const;

export type UploadContext = keyof typeof UPLOAD_POLICIES;
export type MimeType =
  (typeof UPLOAD_POLICIES)[UploadContext]["allowedMimeTypes"][number];

export const GetPresignedUrlSchema = z.object({
  fileName: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename too long")
    .regex(/^[a-zA-Z0-9._\-\s]+$/, "Invalid filename characters")
    .describe("Original name of the file (e.g. 'profile.jpg')"),
  mimeType: z
    .string()
    .min(3)
    .max(100)
    .describe("IANA media type (e.g. 'image/jpeg')"),
  fileSize: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(100 * 1024 * 1024, "File size exceeds 100MB limit")
    .describe("Size of the file in bytes"),
  context: z
    .enum(["avatar", "attachment", "export"])
    .describe("The context/bucket for the upload"),
});

export class GetPresignedUrlDto extends createZodDto(GetPresignedUrlSchema) {
  @ApiProperty({ example: "profile.jpg", description: "Original name of the file" })
  declare fileName: string;

  @ApiProperty({ example: "image/jpeg", description: "IANA media type" })
  declare mimeType: string;

  @ApiProperty({ example: 1024576, description: "Size of the file in bytes" })
  declare fileSize: number;

  @ApiProperty({ example: "avatar", enum: ["avatar", "attachment", "export"], description: "The context/bucket for the upload" })
  declare context: UploadContext;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\-\s]/g, "")
    .replace(/\.{2,}/g, ".")
    .trim()
    .substring(0, 100);
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot >= 0 ? fileName.substring(lastDot).toLowerCase() : "";
}
