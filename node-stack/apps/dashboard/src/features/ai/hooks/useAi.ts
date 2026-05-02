import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "../api/ai.api";
import type { ChatCompletionDto, ChatMessageDto } from "@node-stack/validators";

export const useAiUsage = (workspaceId: string = "default-workspace") => {
  return useQuery({
    queryKey: ["ai", "usage", workspaceId],
    queryFn: async () => {
      const data = await aiApi.getUsage(workspaceId);
      return (data as unknown as { usage: number }).usage;
    },
  });
};

export const useAi = (workspaceId: string = "default-workspace") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const chat = useCallback(async (messages: ChatMessageDto[], options?: Partial<ChatCompletionDto>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiApi.chat({
        messages,
        model: options?.model || "gpt-4o",
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      }, workspaceId);
      queryClient.invalidateQueries({ queryKey: ["ai", "usage", workspaceId] });
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, queryClient]);

  const streamChat = useCallback(async (
    messages: ChatMessageDto[],
    onChunk: (chunk: string) => void,
    options?: Partial<ChatCompletionDto>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const stream = aiApi.streamChat({
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
      queryClient.invalidateQueries({ queryKey: ["ai", "usage", workspaceId] });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, queryClient]);

  return {
    chat,
    streamChat,
    loading,
    error,
  };
};