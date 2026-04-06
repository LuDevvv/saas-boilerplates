import LoadingSkeleton from "@/components/Loading";
import { useAuth } from "@/hooks/stores/useAuth";
import { FC } from "react";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRouteNewUser: FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSkeleton />;

  if (!isAuthenticated) return <Navigate to="/auth/sign-in" />;

  // if (companies.length > 0) return <Navigate to="/" />;

  return children;
};

export default PublicRouteNewUser;
