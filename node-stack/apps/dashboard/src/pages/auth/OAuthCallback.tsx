import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import Loading from "@/components/ui/Loading";
import { cookieTokenStorage, api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore(useShallow((state) => state.setUser));
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (!token) {
      navigate("/auth/sign-in");
      return;
    }

    const processAuth = async () => {
      try {
        cookieTokenStorage.setToken(token);
        if (refreshToken) {
          cookieTokenStorage.setRefreshToken(refreshToken);
        }

        const user = await api.auth.me();
        
        setUser(user);
        queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
        
        navigate("/");
      } catch (error) {
        console.error("OAuth callback error:", error);
        cookieTokenStorage.clear();
        navigate("/auth/sign-in");
      }
    };

    processAuth();
  }, [searchParams, navigate, setUser, queryClient]);

  return <Loading />;
}
