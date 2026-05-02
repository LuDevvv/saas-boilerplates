import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";
import { cookieTokenStorage } from "@/lib/api";

export const useUser = () => {
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  const setAuth = useAuthStore(useShallow((state) => state.setAuth));

  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const token = cookieTokenStorage.getToken();
      
      // If we don't even have a token, don't even try to fetch
      if (!token && !isAuthenticated) {
        return null;
      }

      try {
        const response = await authApi.checkStatus();
        
        // The API returns the user object directly for /auth/me
        const user = (response as any).user || response;
        
        if (user && !isAuthenticated && token) {
          setAuth(token);
        }
        
        return user ?? null;
      } catch (error) {
        // Clear auth if token is invalid
        cookieTokenStorage.removeToken();
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    // Add a small delay to initial check to ensure state is settled
    refetchOnWindowFocus: false,
  });
};
