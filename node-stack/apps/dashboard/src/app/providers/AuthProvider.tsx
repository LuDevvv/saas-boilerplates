import { ReactNode, createContext, useContext } from "react";
import { useAuth } from "@/hooks/stores/useAuth";
import Loading from "@/components/ui/Loading";

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
  const auth = useAuth();

  if (auth.isLoading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};