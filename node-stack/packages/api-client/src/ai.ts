import { AxiosInstance } from "axios";
import { createClient } from "./client.js";
import { z } from "zod";

export type AIJobStatus = "pending" | "processing" | "completed" | "failed";

export interface AIJob {
  id: string;
  type: string;
  status: AIJobStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

const GenerateRequestSchema = z.object({
  type: z.enum(["description", "seo", "social", "image"]),
  context: z.record(z.string(), z.unknown()),
});

export const ai = (client: AxiosInstance) => ({
  generate: async (body: { type: string; context: Record<string, unknown> }) => {
    return await client.post<{ jobId: string }>("/ai/generate", GenerateRequestSchema.parse(body));
  },

  getJobStatus: async (jobId: string) => {
    return await client.get<{ data: AIJob }>(`/ai/jobs/${jobId}`);
  },

  listJobs: async (params?: { status?: AIJobStatus; page?: number; limit?: number }) => {
    return await client.get<{ data: AIJob[]; meta: { page: number; limit: number; total: number } }>("/ai/jobs", { params });
  },

  cancelJob: async (jobId: string) => {
    return await client.post<{ success: boolean }>(`/ai/jobs/${jobId}/cancel`);
  },

  deleteJob: async (jobId: string) => {
    return await client.delete<{ success: boolean }>(`/ai/jobs/${jobId}`);
  },
});
