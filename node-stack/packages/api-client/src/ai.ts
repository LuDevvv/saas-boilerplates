import { 
  SubmitAIJobDto, 
  ChatCompletionDto,
  AIJob,
  AIJobStatus
} from "@node-stack/types";
import { AxiosInstance } from "axios";

export const ai = (client: AxiosInstance) => ({
  submitJob: async (data: SubmitAIJobDto) => {
    return client.post<{ jobId: string; status: string }>("/ai/jobs", data) as unknown as Promise<{ jobId: string; status: string }>;
  },

  chat: async (data: ChatCompletionDto) => {
    return client.post<any>("/ai/chat", data) as unknown as Promise<any>;
  },

  streamChat: async function* (data: ChatCompletionDto) {
    // We use fetch for streaming because it has better browser support for ReadableStreams
    const token = client.defaults.headers.common["Authorization"];
    const workspaceId = client.defaults.headers.common["X-Workspace-ID"];
    const baseURL = client.defaults.baseURL;

    const response = await fetch(`${baseURL}/ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token as string } : {}),
        ...(workspaceId ? { "X-Workspace-ID": workspaceId as string } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() && line.startsWith("data: ")) {
          try {
            const jsonStr = line.substring(6).trim();
            if (jsonStr === "[DONE]") return;
            const chunk = JSON.parse(jsonStr);
            yield chunk;
          } catch (e) {
            console.error("Error parsing stream chunk", e);
          }
        }
      }
    }
  },

  getJobStatus: async (jobId: string) => {
    return client.get<any>(`/ai/jobs/${jobId}`) as unknown as Promise<any>;
  },

  getUsage: async () => {
    return client.get<{ usage: number }>("/ai/usage") as unknown as Promise<{ usage: number }>;
  },
});
