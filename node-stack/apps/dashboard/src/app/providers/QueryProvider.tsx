import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { onlineManager } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

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

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: import.meta.env.PROD,
        retry: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        networkMode: "online",
      },
      mutations: {
        retry: false,
        networkMode: "online",
      },
    },
  });

export interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};