import { ReactNode, createContext, useContext, useEffect } from "react";

import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/stores/useAuth";
import { cookieTokenStorage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuth>["user"];
  logout: ReturnType<typeof useAuth>["logout"];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const setAuth = useAuthStore(state => state.setAuth);
  const auth = useAuth();

  // Synchronize store with query result
  useEffect(() => {
    if (auth.user && !auth.isAuthenticated) {
      const token = cookieTokenStorage.getToken();
      if (token) setAuth(token);
    }
  }, [auth.user, auth.isAuthenticated, setAuth]);

  if (auth.isLoading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};