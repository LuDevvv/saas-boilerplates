export type AiModel = string;

export interface WorkersAiService {
  summarizeText(text: string, maxLength?: number): Promise<string>;
  translateText(text: string, targetLang: string, sourceLang?: string): Promise<string>;
}

export interface WorkersAiEnv {
  AI: {
    run<T = Record<string, unknown>>(model: string, options: { messages: Array<{ role: string; content: string }>; max_tokens?: number }): Promise<T>;
  };
}

export const createWorkersAiService = (ai: WorkersAiEnv["AI"]): WorkersAiService => {
  return {
    async summarizeText(text: string, maxLength = 150): Promise<string> {
      const prompt = `You are a text summarization assistant. Summarize the following text in no more than ${maxLength} characters. Focus on the key points and main ideas.

Text to summarize:
${text}

Summary:`;

      const response = await ai.run<{ response: string }>("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxLength + 50,
      });

      if (!response || !response.response) {
        throw new Error("AI summarization failed: invalid response");
      }

      return response.response;
    },

    async translateText(
      text: string,
      targetLang: string,
      sourceLang = "auto",
    ): Promise<string> {
      const prompt = `You are a translation assistant. Translate the following text from ${sourceLang === "auto" ? "the source language" : sourceLang} to ${targetLang}. Only output the translated text, nothing else.

Text to translate:
${text}

Translation:`;

      const response = await ai.run<{ response: string }>("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: text.length * 2,
      });

      if (!response || !response.response) {
        throw new Error("AI translation failed: invalid response");
      }

      return response.response;
    },
  };
};
