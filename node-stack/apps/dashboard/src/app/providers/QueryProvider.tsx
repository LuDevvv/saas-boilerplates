import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

import { AppError } from "@node-stack/api-client";

/**
 * Aligned with the api-client createQueryClient defaults.
 * Uses the local @tanstack/react-query instance to avoid TypeScript
 * dual-declaration errors when api-client is a workspace reference.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: import.meta.env.PROD,
        networkMode: "online",
        retry: (count, error) => {
          const err = error as AppError | undefined;
          return count < 2 && err?.statusCode !== 401;
        },
      },
      mutations: {
        networkMode: "online",
        retry: false,
      },
    },
  });
}

onlineManager.setEventListener((setOnline) => {
  if (typeof window !== "undefined") {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }
  return undefined;
});

export interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
