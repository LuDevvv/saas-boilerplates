import { Loader2 } from "lucide-react";
import { FC, ReactNode } from "react";

import { useAdminUsers } from "@/features/admin";

interface ManageUsersPageProps {
  children: ReactNode;
}

export const ManageUsersPage: FC<ManageUsersPageProps> = ({ children }) => {
  const { isLoading, error } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-red-600 font-heading">
        Failed to load users.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {children}
    </div>
  );
};