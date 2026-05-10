import { ReactNode, createContext, useContext, useEffect } from "react";

import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/stores/useAuth";
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
  const setUser = useAuthStore(state => state.setUser);
  const auth = useAuth();

  // After a page reload the cookie still exists but the store may be stale.
  // Re-hydrate the store once the TanStack Query fetch resolves.
  useEffect(() => {
    if (auth.user && !auth.isAuthenticated) {
      setUser(auth.user);
    }
  }, [auth.user, auth.isAuthenticated, setUser]);

  if (auth.isLoading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
