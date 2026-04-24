import { useState, useCallback } from "react";
import { aiService } from "@/services/ai/AiService";
import { ChatCompletionDto, ChatMessageDto } from "@node-stack/validators";

export const useAi = (workspaceId: string = "default-workspace") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const chat = useCallback(async (messages: ChatMessageDto[], options?: Partial<ChatCompletionDto>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.chat({
        messages,
        model: options?.model || "gpt-4o",
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      }, workspaceId);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const streamChat = useCallback(async (
    messages: ChatMessageDto[], 
    onChunk: (chunk: string) => void,
    options?: Partial<ChatCompletionDto>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const stream = aiService.streamChat({
        messages,
        model: options?.model || "gpt-4o",
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      }, workspaceId);

      for await (const chunk of stream) {
        if (chunk.content) {
          onChunk(chunk.content);
        }
      }
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const getUsage = useCallback(async () => {
    try {
      const data = await aiService.getUsage(workspaceId);
      return (data as any).usage as number;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  }, [workspaceId]);

  return {
    chat,
    streamChat,
    getUsage,
    loading,
    error,
  };
};
