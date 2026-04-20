import { apiClient, cookieTokenStorage } from "@/lib/api-client";
import { BaseService } from "../BaseService";
import { ChatCompletionDto } from "@node-stack/validators";

export class AiService extends BaseService {
  constructor() {
    super("ai");
  }

  async chat(dto: ChatCompletionDto, workspaceId: string) {
    return this.handleRequest(() => 
      apiClient.post(`/ai/chat`, dto, {
        headers: {
          "x-workspace-id": workspaceId,
        }
      })
    );
  }

  async *streamChat(dto: ChatCompletionDto, workspaceId: string) {
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
  }

  async getUsage(workspaceId: string) {
    return this.handleRequest(() => 
      apiClient.get(`/ai/usage`, {
        headers: {
          "x-workspace-id": workspaceId,
        }
      })
    );
  }
}

export const aiService = new AiService();
