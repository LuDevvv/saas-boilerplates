import { z } from "zod";

export const MediaTransformOptionsSchema = z.object({
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.enum(["webp", "avif", "jpeg", "png"]).optional(),
  quality: z.number().int().min(1).max(100).optional(),
});

export type MediaTransformOptions = z.infer<typeof MediaTransformOptionsSchema>;

/**
 * Defines the RPC contract between the Core API and Media Worker
 */
export interface MediaWorkerRPC {
  transformImage(
    key: string,
    options: MediaTransformOptions,
  ): Promise<ArrayBuffer>;
}
