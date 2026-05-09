import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { api, cookieTokenStorage } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";

export const useUser = () => {
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));

  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      try {
        const user = await api.auth.me();
        return user;
      } catch (error: unknown) {
        // Only treat as non-existent user if it's a 401 or 403
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any)?.statusCode || (error as any)?.response?.status || (error as any)?.originalError?.response?.status;
        if (status === 401 || status === 403) {
          return null;
        }
        
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!cookieTokenStorage.getToken() || isAuthenticated,
  });
};
