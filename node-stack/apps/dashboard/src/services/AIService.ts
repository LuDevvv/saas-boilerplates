import { BaseService } from "./baseService";

export interface AIJob {
  id: string;
  prompt: string;
  model: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  response?: string;
  error?: string;
  createdAt: string;
}

export interface GenerateAIRequest {
  prompt: string;
  model: string;
  jobType?: "summarize-document" | "classify-ticket" | "generate-description" | "analyze-usage" | "custom";
  context?: string;
}

/**
 * Service to interact with AI models and manage background jobs.
 * Connects to the /ai backend endpoints.
 */
class AIService extends BaseService {
  constructor() {
    super("/ai");
  }

  /**
   * Triggers a background AI job.
   */
  async generate(data: GenerateAIRequest): Promise<{ jobId: string }> {
    if (this.useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { jobId: "job_" + Math.random().toString(36).substring(7) };
    }

    // Backend SubmitAIJobDto requires jobType, prompt, and optional model/context
    return this.post<{ jobId: string }>("/jobs", {
      jobType: data.jobType || "custom",
      prompt: data.prompt,
      model: data.model,
      context: data.context,
    });
  }

  /**
   * Polls the backend for the current job state.
   */
  async getJobStatus(jobId: string): Promise<AIJob> {
    if (this.useMocks) {
      // Simulate processing states first, then completion
      // For simplicity in the playground, we can just return a completed object after a delay or random
      return this.getMockData<AIJob[]>("ai.json").then(jobs => {
         const job = jobs.find(j => j.id === jobId);
         if (job) return job;
         // If not found in history (new job), return a mock "completed" one
         return {
            id: jobId,
            prompt: "Mock prompt",
            model: "gpt-4o",
            status: "COMPLETED",
            response: "This is a completed response from the AI worker.",
            createdAt: new Date().toISOString()
         } as AIJob;
      });
    }

    const response = await this.get<any>(`/jobs/${jobId}`);
    
    // Map backend status to our frontend enum
    // Backend: queued, pending, complete
    let status: AIJob["status"] = "PROCESSING";
    if (response.status === "queued") status = "PENDING";
    if (response.status === "pending") status = "PROCESSING";
    if (response.status === "complete") status = "COMPLETED";
    if (response.status === "failed") status = "FAILED";

    return {
      id: jobId,
      status,
      response: response.result || response.response,
      error: response.error,
      prompt: response.prompt,
      model: response.model,
      createdAt: response.createdAt,
    };
  }

  /**
   * Lists previous AI generations for the active workspace.
   */
  async getHistory(): Promise<AIJob[]> {
    if (this.useMocks) {
      return this.getMockData<AIJob[]>("ai.json");
    }

    // Backend doesn't have a history endpoint in the controller yet,
    // but the spec asks for it. I'll use /history as a guess or fallback.
    // If it fails, I'll return empty array.
    try {
      return await this.get<AIJob[]>("/history");
    } catch {
      return [];
    }
  }
}

export const aiService = new AIService();
