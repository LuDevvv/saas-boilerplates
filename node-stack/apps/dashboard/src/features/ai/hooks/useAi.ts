import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChatCompletionDto, ChatMessageDto } from "@node-stack/types";

export const useAiUsage = (workspaceId: string) => {
  return useQuery({
    queryKey: ["ai", "usage", workspaceId],
    queryFn: async () => {
      const data = await api.ai.getJobStatus(workspaceId); // Adjusting based on available methods
      return data;
    },
    enabled: !!workspaceId,
  });
};

export const useAi = (workspaceId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const chat = useCallback(async (messages: ChatMessageDto[], options?: Partial<ChatCompletionDto>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.ai.chat({
        messages,
        model: options?.model || "gpt-4o",
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });
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
      const stream = api.ai.streamChat({
        messages,
        model: options?.model || "gpt-4o",
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });

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