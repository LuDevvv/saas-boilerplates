import { QueryClient } from "@tanstack/react-query";

import { AppError } from "./client.js";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (count, error) => {
          const err = error as AppError | undefined;
          return count < 2 && err?.statusCode !== 401;
        },
      },
    },
  });
}
