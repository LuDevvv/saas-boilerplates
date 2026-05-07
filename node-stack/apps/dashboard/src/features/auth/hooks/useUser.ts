import { useQuery } from "@tanstack/react-query";
import { api, cookieTokenStorage } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";

export const useUser = () => {
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));

  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      try {
        const user = await api.auth.me();
        return user;
      } catch (error: any) {
        // Only treat as non-existent user if it's a 401 or 403
        const status = error?.statusCode || error?.response?.status || error?.originalError?.response?.status;
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
