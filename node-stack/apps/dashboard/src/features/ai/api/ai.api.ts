import { apiClient } from "@/shared/lib/api";
import type { ChatCompletionDto } from "@node-stack/validators";

export interface AiUsage {
  tokensUsed: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  period: string;
}

export interface StreamChunk {
  content?: string;
  done?: boolean;
  error?: string;
}

export const aiApi = {
  chat: (dto: ChatCompletionDto, workspaceId: string) =>
    apiClient.post("/ai/chat", dto, {
      headers: { "x-workspace-id": workspaceId },
    }),

  streamChat: async function* (dto: ChatCompletionDto, workspaceId: string) {
    const { cookieTokenStorage } = await import("@/shared/lib/api");
    const token = cookieTokenStorage.getToken();
    const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api/v1";

    const response = await fetch(`${baseUrl}/ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-workspace-id": workspaceId,
      },
      body: JSON.stringify(dto),
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
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.substring(6));
            yield data;
          } catch (e) {
            console.error("Error parsing stream chunk", e);
          }
        }
      }
    }
  },

  getUsage: (workspaceId: string): Promise<AiUsage> =>
    apiClient.get("/ai/usage", {
      headers: { "x-workspace-id": workspaceId },
    }),
};