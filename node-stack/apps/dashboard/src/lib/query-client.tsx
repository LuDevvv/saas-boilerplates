import { QueryClient, QueryClientProvider , onlineManager } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";

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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: import.meta.env.PROD,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      networkMode: "online",
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});

export interface QueryClientProviderProps {
  children: ReactNode;
}

export const QueryClientWrapper = ({ children }: QueryClientProviderProps) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export { useQueryClient } from "@tanstack/react-query";