import { z } from "./zod";

/**
 * Validation schema for requesting an upload URL.
 */
export const uploadRequestSchema = z
  .object({
    fileName: z.string().min(1),
    contentType: z
      .string()
      .regex(/^(image\/jpeg|image\/png|image\/webp|application\/pdf)$/),
    fileSize: z
      .number()
      .int()
      .positive()
      .max(10 * 1024 * 1024),
  })
  .openapi("UploadRequest");

/**
 * Schema for upload URL request success payload.
 */
export const uploadResponseDataSchema = z
  .object({
    uploadUrl: z.string().url(),
    publicUrl: z.string().url(),
    key: z.string().min(1),
  })
  .openapi("UploadResponseData");

/**
 * Standard success response schema for storage operations.
 */
export const uploadSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    data: uploadResponseDataSchema,
  })
  .openapi("UploadSuccessResponse");

export type UploadRequestDTO = z.infer<typeof uploadRequestSchema>;
export type UploadResponseDTO = z.infer<typeof uploadResponseDataSchema>;
