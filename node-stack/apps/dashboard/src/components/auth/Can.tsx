import { FC, ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/config/permissions";

interface CanProps {
  I: Permission;
  a?: string; // Future use for resource-specific permissions
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Declarative component for conditional rendering based on user permissions.
 * If the user has the required permission, it renders the children.
 * Otherwise, it renders the optional fallback or null.
 */
export const Can: FC<CanProps> = ({ I, children, fallback = null }) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(I)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
